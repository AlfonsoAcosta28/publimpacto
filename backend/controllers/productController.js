const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const ProductImage = require('../models/ProductImage');
const Inventory = require('../models/Inventory');
const sequelize = require('sequelize');

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

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
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

        // Add base URL to image path
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productData = product.toJSON();
        productData.ProductImages = productData.ProductImages.map(img => ({
            ...img,
            image_url: `${baseUrl}${img.image_url}`
        }));
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
            where: { category_id: categoryId },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'title'] },
                { model: ProductImage, as: 'ProductImages' }
            ]
        });

        // Add base URL to all images
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productsWithUrls = products.map(product => {
            const productData = product.toJSON();
            // Add full URL to all ProductImages
            productData.ProductImages = productData.ProductImages.map(img => ({
                ...img,
                image_url: `${baseUrl}${img.image_url}`
            }));
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

exports.createProduct = async (req, res) => {
    // console.log(req.body)
    // console.log(req.files)
    try {
        const { title, base_price, badge, category_id, description } = req.body;
        console.log(base_price )
        
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

        // Update main product data
        await product.update({
            title: title || product.title,
            description: description || product.description,
            base_price: base_price || product.base_price,
            badge: badge !== undefined ? badge : product.badge,
            category_id: category_id || product.category_id
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
exports.getRecentProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const products = await Product.findAll({
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
            order: [['updated_at', 'DESC']],
            limit: limit
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
        res.status(500).json({ message: 'Error al obtener los productos recientes', error: error.message });
    }
};

exports.getFilteredProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 16,
            category,
            minPrice,
            maxPrice,
            sortBy = 'price-low',
            search
        } = req.query;

        const where = {};

        // Filtro de categorías
        if (category) {
            where.category_id = category.split(',');
        }

        // Filtro de precio
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }

        // Filtro de búsqueda
        console.log(search)
        
        if (search) {
            where[Op.or] = [
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
                order = [['price', 'ASC']];
                break;
            case 'price-high':
                order = [['price', 'DESC']];
                break;
            case 'newest':
                order = [['created_at', 'DESC']];
                break;
            case 'popular':
                order = [['views', 'DESC']];
                break;
            default:
                order = [['price', 'ASC']];
        }

        const products = await Product.findAll({
            where,
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
            order,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        // Agregar la URL base a las imágenes
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productsWithUrls = products.map(product => {
            const productData = product.toJSON();
            const primaryImage = productData.ProductImages?.find(img => img.is_primary);
            productData.image = primaryImage ? `${baseUrl}${primaryImage.image_url}` : null;
            return productData;
        });

        res.json({
            products: productsWithUrls,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al obtener los productos filtrados', 
            error: error.message 
        });
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