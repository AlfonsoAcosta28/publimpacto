const Category = require('../models/Category');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();

        // Add base URL to image paths
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const categoriesWithUrls = categories.map(category => {
            const categoryData = category.toJSON();
            if (categoryData.image) {
                categoryData.image = `${baseUrl}${categoryData.image}`;
            }
            return categoryData;
        });

        res.json(categoriesWithUrls);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las categorías', error: error.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la categoría', error: error.message });
    }
};

exports.getCategoryWithProducts = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id, {
            include: [{ model: Product }]
        });

        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la categoría con productos', error: error.message });
    }
};

exports.createCategory = async (req, res) => {
    // console.log( req.body)
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'La imagen es requerida' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const { title, description } = req.body;

        const category = await Category.create({
            title,
            description,
            image: imageUrl
        });

        // Add base URL to image path
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const categoryData = category.toJSON();
        categoryData.image = `${baseUrl}${imageUrl}`;

        res.status(201).json({
            message: 'Categoría creada exitosamente',
            category: categoryData
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la categoría', error: error.message });
        console.log(error)
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        const { title, description } = req.body;

        let imageUrl = category.image;

        // If new image uploaded, update and delete old one
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;

            // Delete old image
            if (category.image && category.image.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, '..', category.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        await category.update({
            title: title || category.title,
            description: description || category.description,
            image: imageUrl
        });

        res.json({
            message: 'Categoría actualizada exitosamente',
            category
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la categoría', error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        // Check if category has associated products
        const productCount = await Product.count({ where: { category_id: category.id } });
        if (productCount > 0) {
            return res.status(400).json({
                message: 'No se puede eliminar la categoría porque tiene productos asociados'
            });
        }

        // Delete the image file
        if (category.image && category.image.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '..', category.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await category.destroy();

        res.json({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la categoría', error: error.message });
    }
};

exports.getRecentCategories = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const categories = await Category.findAll({
            order: [['updated_at', 'DESC']],
            limit: limit
        });

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const categoriesWithUrls = categories.map(category => {
            const categoryData = category.toJSON();
            if (categoryData.image) {
                categoryData.image = `${baseUrl}${categoryData.image}`;
            }
            return categoryData;
        });

        res.json(categoriesWithUrls);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las categorias mas recientes', error: error.message });
    }
};