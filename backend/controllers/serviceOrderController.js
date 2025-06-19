const ServiceOrder = require('../models/ServiceOrder');
const Service = require('../models/Service');
// const ServiceInventory = require('../models/ServiceInventory');
const { Op } = require('sequelize');

// Crear una nueva cotización de servicio
exports.createServiceQuote = async (req, res) => {
  try {
    const {
      user_id,
      service_id,
      variant_id,
      service_options,
      comments,
      estimated_price,
      quantity,
      delivery_date,
      special_requirements
    } = req.body;

    // Validar campos requeridos
    if (!user_id || !service_id) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        missing: {
          user_id: !user_id,
          service_id: !service_id
        }
      });
    }

    // Verificar que el servicio existe
    const service = await Service.findByPk(service_id);
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    // Verificar que la variante existe si se proporciona
    if (variant_id) {
      const variant = await ServiceInventory.findByPk(variant_id);
      if (!variant) {
        return res.status(400).json({ message: 'La variante seleccionada no existe' });
      }
    }

    // Crear la cotización
    const quote = await ServiceOrder.create({
      user_id,
      service_id,
      variant_id,
      service_options: service_options ? JSON.stringify(service_options) : null,
      comments: comments?.trim() || '',
      estimated_price: estimated_price ? parseFloat(estimated_price) : null,
      quantity: quantity ? parseInt(quantity) : 1,
      delivery_date: delivery_date || null,
      special_requirements: special_requirements?.trim() || '',
      status: 'pending'
    });

    // Obtener la cotización completa
    const completeQuote = await ServiceOrder.findOne({
      where: { id: quote.id },
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'base_price', 'description']
        },
        {
          model: ServiceInventory,
          as: 'variant',
          attributes: ['id', 'variant_name', 'price_modifier']
        }
      ]
    });

    res.status(201).json(completeQuote);
  } catch (error) {
    console.error('Error al crear cotización de servicio:', error);
    res.status(500).json({ message: 'Error al crear la cotización', error: error.message });
  }
};

// Obtener todas las cotizaciones (para admin)
exports.getAllServiceQuotes = async (req, res) => {
  try {
    const quotes = await ServiceOrder.findAll({
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name']
        },
        {
          model: ServiceInventory,
          as: 'variant',
          attributes: ['id', 'variant_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(quotes);
  } catch (error) {
    console.error('Error al obtener cotizaciones:', error);
    res.status(500).json({ message: 'Error al obtener las cotizaciones', error: error.message });
  }
};

// Obtener una cotización específica
exports.getServiceQuoteById = async (req, res) => {
  try {
    const quote = await ServiceOrder.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'base_price', 'description']
        },
        {
          model: ServiceInventory,
          as: 'variant',
          attributes: ['id', 'variant_name', 'price_modifier']
        }
      ]
    });

    if (!quote) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }

    res.json(quote);
  } catch (error) {
    console.error('Error al obtener cotización:', error);
    res.status(500).json({ message: 'Error al obtener la cotización', error: error.message });
  }
};

// Actualizar estado de una cotización
exports.updateServiceQuoteStatus = async (req, res) => {
  try {
    const { status, admin_comments, final_price } = req.body;
    const { id } = req.params;

    const quote = await ServiceOrder.findByPk(id);
    if (!quote) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }

    const updateData = { status };
    if (admin_comments) updateData.admin_comments = admin_comments;
    if (final_price) updateData.final_price = parseFloat(final_price);

    await quote.update(updateData);

    res.json(quote);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error al actualizar el estado', error: error.message });
  }
};

// Obtener cotizaciones por usuario
exports.getQuotesByUserId = async (req, res) => {
  try {
    const user_id = req.user.id; // Obtener del token JWT

    const quotes = await ServiceOrder.findAll({
      where: { user_id },
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name']
        },
        {
          model: ServiceInventory,
          as: 'variant',
          attributes: ['id', 'variant_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(quotes);
  } catch (error) {
    console.error('Error al obtener cotizaciones por usuario:', error);
    res.status(500).json({ message: 'Error al obtener las cotizaciones', error: error.message });
  }
};

// Obtener cotizaciones por email del cliente (para compatibilidad)
exports.getQuotesByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const quotes = await ServiceOrder.findAll({
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name']
        },
        {
          model: ServiceInventory,
          as: 'variant',
          attributes: ['id', 'variant_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(quotes);
  } catch (error) {
    console.error('Error al obtener cotizaciones por email:', error);
    res.status(500).json({ message: 'Error al obtener las cotizaciones', error: error.message });
  }
}; 