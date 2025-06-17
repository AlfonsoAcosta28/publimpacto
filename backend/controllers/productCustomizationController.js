const ProductCustomization = require('../models/ProductCustomization');
const Product = require('../models/Product');

// Obtener todas las personalizaciones
exports.getAllCustomizations = async (req, res) => {
  try {
    const customizations = await ProductCustomization.findAll({
      where: {
        deleted_at: null
      },
      include: [{
        model: Product,
        as: 'product'
      }]
    });
    res.json(customizations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las personalizaciones', error: error.message });
  }
};

// Obtener personalizaciones por producto
exports.getCustomizationsByProduct = async (req, res) => {
  try {
    const customizations = await ProductCustomization.findAll({
      where: {
        product_id: req.params.productId,
        deleted_at: null
      },
      include: [{
        model: Product,
        as: 'product'
      }]
    });
    res.json(customizations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las personalizaciones', error: error.message });
  }
};

// Obtener personalizaciones por usuario
exports.getCustomizationsByUser = async (req, res) => {
  try {
    const customizations = await ProductCustomization.findAll({
      where: {
        user_id: req.params.userId,
        deleted_at: null
      },
      include: [{
        model: Product,
        as: 'product'
      }]
    });
    res.json(customizations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las personalizaciones', error: error.message });
  }
};

// Crear una nueva personalización
exports.createCustomization = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado ninguna imagen' });
    }

    const product = await Product.findOne({
      where: {
        id: req.params.productId,
        deleted_at: null
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const customization = await ProductCustomization.create({
      product_id: product.id,
      user_id: req.user.id, // Asumiendo que tienes autenticación
      image_path: req.file.path,
      status: 'pending',
      notes: req.body.notes
    });

    res.status(201).json(customization);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la personalización', error: error.message });
  }
};

// Actualizar estado de personalización
exports.updateCustomizationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const customization = await ProductCustomization.findOne({
      where: {
        id: req.params.id,
        deleted_at: null
      }
    });

    if (!customization) {
      return res.status(404).json({ message: 'Personalización no encontrada' });
    }

    await customization.update({
      status,
      notes: notes || customization.notes
    });

    res.json(customization);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la personalización', error: error.message });
  }
};

// Eliminar personalización (soft delete)
exports.deleteCustomization = async (req, res) => {
  try {
    const customization = await ProductCustomization.findOne({
      where: {
        id: req.params.id,
        deleted_at: null
      }
    });

    if (!customization) {
      return res.status(404).json({ message: 'Personalización no encontrada' });
    }

    await customization.update({ deleted_at: new Date() });
    res.json({ message: 'Personalización eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la personalización', error: error.message });
  }
}; 