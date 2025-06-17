const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const ProductImage = require('../models/ProductImage');
const Inventory = require('../models/Inventory');
const sequelize = require('sequelize');

// Public Routes
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            where: {
                activo: true // Solo productos activos
            },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'title'] },
                { model: ProductImage, as: 'ProductImages' },
                {
                    model: Inventory,
                    as: 'inventory',
                    where: {
                        status: 'active',
                        [Op.and]: [
                            sequelize.literal('inventory.stock_quantity - inventory.reserved_quantity > 0'),
                            sequelize.literal('inventory.stock_quantity >= inventory.min_stock_level')
                        ]
                    },
                    required: true
                }
            ]
        });

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado o no disponible' });
        }

        // Add base URL to image path and clean sensitive data
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productData = product.toJSON();
        
        // Limpiar datos sensibles
        delete productData.deleted_at;
        delete productData.activo;
        
        // Limpiar datos sensibles de las imágenes
        productData.ProductImages = productData.ProductImages.map(img => {
            const cleanImg = {
                id: img.id,
                image_url: `${baseUrl}${img.image_url}`,
                is_primary: img.is_primary
            };
            return cleanImg;
        });
        
        const primaryImage = productData.ProductImages.find(img => img.is_primary);
        productData.image = primaryImage ? primaryImage.image_url : null;

        res.json(productData);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
};
exports.getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Verify if category exists
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        const products = await Product.findAll({
            where: { 
                category_id: categoryId,
                activo: true // Solo productos activos
            },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'title'] },
                { model: ProductImage, as: 'ProductImages' },
                {
                    model: Inventory,
                    as: 'inventory',
                    where: {
                        status: 'active',
                        [Op.and]: [
                            sequelize.literal('inventory.stock_quantity - inventory.reserved_quantity > 0'),
                            sequelize.literal('inventory.stock_quantity >= inventory.min_stock_level')
                        ]
                    },
                    required: true
                }
            ]
        });

        // Add base URL to all images and clean sensitive data
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productsWithUrls = products.map(product => {
            const productData = product.toJSON();
            
            // Limpiar datos sensibles
            delete productData.deleted_at;
            delete productData.activo;
            
            // Limpiar datos sensibles de las imágenes
            productData.ProductImages = productData.ProductImages.map(img => {
                const cleanImg = {
                    id: img.id,
                    image_url: `${baseUrl}${img.image_url}`,
                    is_primary: img.is_primary
                };
                return cleanImg;
            });

            // Set primary image
            const primaryImage = productData.ProductImages.find(img => img.is_primary);
            productData.image = primaryImage ? primaryImage.image_url : null;
            
            return productData;
        });

        res.json(productsWithUrls);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos por categoría', error: error.message });
    }
};

exports.getRelatedProducts = async (req, res) => {
    try {
        const { productId, categoryId } = req.params;
        const limit = 8;

        const products = await Product.findAll({
            where: {
                category_id: categoryId,
                id: {
                    [Op.ne]: productId // Excluir el producto actual
                }
            },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'title'] },
                { model: ProductImage, as: 'ProductImages' },
                {
                    model: Inventory,
                    as: 'inventory',
                    where: {
                        status: 'active',
                        [Op.and]: [
                            sequelize.literal('inventory.stock_quantity - inventory.reserved_quantity > 0'),
                            sequelize.literal('inventory.stock_quantity >= inventory.min_stock_level')
                        ]
                    },
                    required: true
                }
            ],
            limit: limit,
            order: sequelize.literal('RAND()') // Orden aleatorio
        });

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productsWithUrls = products.map(product => {
            const productData = product.toJSON();
            const primaryImage = productData.ProductImages?.find(img => img.is_primary);
            productData.image = primaryImage ? `${baseUrl}${primaryImage.image_url}` : null;
            return productData;
        });

        res.json(productsWithUrls);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos relacionados', error: error.message });
    }
};

exports.getPaginatedProducts = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            category_id,
            minPrice,
            maxPrice,
            search,
            sortBy = 'newest'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        let whereClause = {
            activo: true // Solo productos activos
        };

        // Filtro por categoría
        if (category_id) {
            whereClause.category_id = category_id;
        }

        // Filtro por precio
        if (minPrice || maxPrice) {
            whereClause.base_price = {};
            if (minPrice) whereClause.base_price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) whereClause.base_price[Op.lte] = parseFloat(maxPrice);
        }

        // Filtro de búsqueda
        if (search) {
            whereClause[Op.or] = [
                sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('title')),
                    { [Op.like]: `%${search.toLowerCase()}%` }
                ),
                sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('description')),
                    { [Op.like]: `%${search.toLowerCase()}%` }
                )
            ];
        }

        // Ordenamiento
        let order;
        switch (sortBy) {
            case 'price-low':
                order = [['base_price', 'ASC']];
                break;
            case 'price-high':
                order = [['base_price', 'DESC']];
                break;
            case 'newest':
                order = [['created_at', 'DESC']];
                break;
            case 'popular':
                order = [['views', 'DESC']];
                break;
            default:
                order = [['created_at', 'DESC']];
        }

        const products = await Product.findAndCountAll({
            where: whereClause,
            include: [
                { 
                    model: Category, 
                    as: 'category', 
                    attributes: ['id', 'title'] 
                },
                { 
                    model: ProductImage, 
                    as: 'ProductImages',
                    attributes: ['id', 'image_url', 'is_primary']
                },
                {
                    model: Inventory,
                    as: 'inventory',
                    where: {
                        status: 'active',
                        [Op.and]: [
                            sequelize.literal('inventory.stock_quantity - inventory.reserved_quantity > 0'),
                            sequelize.literal('inventory.stock_quantity >= inventory.min_stock_level')
                        ]
                    },
                    required: true
                }
            ],
            limit: parseInt(limit),
            offset: offset,
            order: order
        });

        // Procesar las imágenes y limpiar datos sensibles
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const processedProducts = products.rows.map(product => {
            const productData = product.toJSON();
            
            // Limpiar datos sensibles
            delete productData.deleted_at;
            delete productData.activo;
            
            // Procesar imágenes
            productData.ProductImages = productData.ProductImages.map(img => ({
                id: img.id,
                image_url: `${baseUrl}${img.image_url}`,
                is_primary: img.is_primary
            }));

            // Establecer imagen principal
            const primaryImage = productData.ProductImages.find(img => img.is_primary);
            productData.image = primaryImage ? primaryImage.image_url : null;

            return productData;
        });

        res.json({
            success: true,
            data: processedProducts,
            pagination: {
                total: products.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(products.count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error en getPaginatedProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos',
            error: error.message
        });
    }
};

// Admin
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: {
                activo: true
            },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'title'] },
                { model: ProductImage, as: 'ProductImages' }
            ]
        });


        // Add base URL to image paths
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productsWithUrls = products.map(product => {
            const productData = product.toJSON();
            const primaryImage = productData.ProductImages?.find(img => img.is_primary);
            productData.image = primaryImage ? `${baseUrl}${primaryImage.image_url}` : null;

            productData.ProductImages = productData.ProductImages?.map(img => ({
                ...img,
                image_url: `${baseUrl}${img.image_url}`
            }));

            return productData;
        });

        res.json(productsWithUrls);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
        console.log(error);
    }
};
exports.createProduct = async (req, res) => {
    // console.log(req.body)
    // console.log(req.files)
    try {
        const { title, base_price, badge, category_id, description } = req.body;
        console.log(base_price)

        // if(category_id == null || price == null ||)
        if (!req.files || !req.files['mainImage']) {
            return res.status(400).json({ message: 'La imagen principal es requerida' });
        }

        const product = await Product.create({
            title,
            description,
            base_price,
            badge,
            category_id
        });

        // if(product)

        const mainImageUrl = `/uploads/${req.files['mainImage'][0].filename}`;


        await ProductImage.create({
            product_id: product.id,
            image_url: mainImageUrl,
            is_primary: true
        });

        if (req.files['secondaryImages']) {
            const secondaryImages = req.files['secondaryImages'].map(file => ({
                product_id: product.id,
                image_url: `/uploads/${file.filename}`,
                is_primary: false
            }));

            await ProductImage.bulkCreate(secondaryImages);
        }

        // Obtener el producto con todas sus imágenes
        const productWithImages = await Product.findByPk(product.id, {
            include: [
                { model: Category, as: 'category', attributes: ['id', 'title'] },
                { model: ProductImage, as: 'ProductImages' }
            ]
        });

        // Add base URL to image paths
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productData = productWithImages.toJSON();
        productData.ProductImages = productData.ProductImages.map(img => ({
            ...img,
            image_url: `${baseUrl}${img.image_url}`
        }));

        res.status(201).json({
            message: 'Producto creado exitosamente',
            product: productData
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
        console.log(error)
    }
};
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const { title, base_price, badge, category_id, description } = req.body;

        // If category ID is provided, verify if it exists
        if (category_id) {
            const category = await Category.findByPk(category_id);
            if (!category) {
                return res.status(404).json({ message: 'Categoría no encontrada' });
            }
        }

        // Calcular el nuevo precio con descuento si existe un descuento y se actualiza el precio base
        let discountedPrice = product.personalization_price;
        if (base_price && product.discount_percentage) {
            discountedPrice = base_price * (1 - product.discount_percentage / 100);
        }

        // Update main product data
        await product.update({
            title: title || product.title,
            description: description || product.description,
            base_price: base_price || product.base_price,
            badge: badge !== undefined ? badge : product.badge,
            category_id: category_id || product.category_id,
            personalization_price: discountedPrice
        });

        // Handle image updates if provided
        if (req.files) {
            // Handle main image
            if (req.files['mainImage']) {
                const mainImageUrl = `/uploads/${req.files['mainImage'][0].filename}`;
                // Update or create primary image
                await ProductImage.upsert({
                    product_id: product.id,
                    image_url: mainImageUrl,
                    is_primary: true
                });
            }

            // Handle secondary images
            if (req.files['secondaryImages']) {
                const secondaryImages = req.files['secondaryImages'].map(file => ({
                    product_id: product.id,
                    image_url: `/uploads/${file.filename}`,
                    is_primary: false
                }));
                await ProductImage.bulkCreate(secondaryImages);
            }
        }

        // Reload the product with all associations
        const updatedProduct = await Product.findByPk(product.id, {
            include: [
                { model: Category, as: 'category', attributes: ['id', 'title'] },
                { model: ProductImage, as: 'ProductImages' }
            ]
        });

        // Add base URL to image paths
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productData = updatedProduct.toJSON();
        productData.ProductImages = productData.ProductImages.map(img => ({
            ...img,
            image_url: `${baseUrl}${img.image_url}`
        }));
        const primaryImage = productData.ProductImages.find(img => img.is_primary);
        productData.image = primaryImage ? primaryImage.image_url : null;

        res.json({
            message: 'Producto actualizado exitosamente',
            product: productData
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
};
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Soft delete - cambiar estado a inactivo
        await product.update({ activo: false });

        res.json({ message: 'Producto desactivado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al desactivar el producto', error: error.message });
    }
};

exports.applyDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const { discountType, value } = req.body;

        console.log('Aplicando descuento:', { id, discountType, value });

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        let discountPercentage;
        let discountedPrice;

        if (discountType === 'percentage') {
            // Validar que el porcentaje esté entre 0 y 100
            if (value < 0 || value > 100) {
                return res.status(400).json({ message: 'El porcentaje de descuento debe estar entre 0 y 100' });
            }
            discountPercentage = value;
            discountedPrice = product.base_price * (1 - value / 100);
        } else if (discountType === 'price') {
            // Validar que el precio con descuento sea menor al precio base
            if (value >= product.base_price) {
                return res.status(400).json({ message: 'El precio con descuento debe ser menor al precio base' });
            }
            discountedPrice = value;
            discountPercentage = ((product.base_price - value) / product.base_price) * 100;
        } else {
            return res.status(400).json({ message: 'Tipo de descuento no válido. Use "percentage" o "price"' });
        }

        console.log('Valores calculados:', { discountPercentage, discountedPrice });

        // Actualizar el producto con el descuento
        await product.update({
            discount_percentage: discountPercentage,
            personalization_price: discountedPrice
        });

        // Obtener el producto actualizado con sus relaciones
        const updatedProduct = await Product.findByPk(id, {
            include: [
                { model: Category, as: 'category', attributes: ['id', 'title'] },
                { model: ProductImage, as: 'ProductImages' }
            ]
        });

        console.log('Producto actualizado:', updatedProduct.toJSON());

        // Procesar las imágenes
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productData = updatedProduct.toJSON();
        productData.ProductImages = productData.ProductImages.map(img => ({
            ...img,
            image_url: `${baseUrl}${img.image_url}`
        }));

        res.json({
            message: 'Descuento aplicado exitosamente',
            product: productData
        });
    } catch (error) {
        console.error('Error al aplicar descuento:', error);
        res.status(500).json({ message: 'Error al aplicar el descuento', error: error.message });
    }
};

exports.removeDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Eliminar el descuento estableciendo los valores a null
        await product.update({
            discount_percentage: null,
            personalization_price: null
        });

        // Obtener el producto actualizado
        const updatedProduct = await Product.findByPk(id, {
            include: [
                { model: Category, as: 'category', attributes: ['id', 'title'] },
                { model: ProductImage, as: 'ProductImages' }
            ]
        });

        // Procesar las imágenes
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productData = updatedProduct.toJSON();
        productData.ProductImages = productData.ProductImages.map(img => ({
            ...img,
            image_url: `${baseUrl}${img.image_url}`
        }));

        res.json({
            message: 'Descuento eliminado exitosamente',
            product: productData
        });
    } catch (error) {
        console.error('Error al eliminar descuento:', error);
        res.status(500).json({ message: 'Error al eliminar el descuento', error: error.message });
    }
};