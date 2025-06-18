const ServiceOrder = require('../models/ServiceOrder');
const ServiceOrderItem = require('../models/ServiceOrderItem');
const Service = require('../models/Service');
const ServiceInventory = require('../models/ServiceInventory');
const { Op } = require('sequelize');

// Crear una nueva orden de servicio
exports.createServiceOrder = async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      service_id,
      variant_id,
      service_options,
      comments,
      total_price
    } = req.body;

    // Validar campos requeridos
    if (!customer_name || !customer_email || !customer_phone || !service_id || !total_price) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        missing: {
          customer_name: !customer_name,
          customer_email: !customer_email,
          customer_phone: !customer_phone,
          service_id: !service_id,
          total_price: !total_price
        }
      });
    }

    // Verificar que el servicio existe
    const service = await Service.findByPk(service_id);
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    // Verificar stock si hay variante seleccionada
    if (variant_id) {
      const variant = await ServiceInventory.findByPk(variant_id);
      if (!variant || variant.quantity <= 0) {
        return res.status(400).json({ message: 'La variante seleccionada no está disponible' });
      }
    }

    // Crear la orden
    const order = await ServiceOrder.create({
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim(),
      customer_phone: customer_phone.trim(),
      service_id,
      variant_id,
      comments: comments?.trim() || '',
      total_price: parseFloat(total_price),
      status: 'pending'
    });

    // Crear los items de la orden con las opciones del servicio
    if (service_options && Object.keys(service_options).length > 0) {
      await ServiceOrderItem.create({
        service_order_id: order.id,
        option_name: 'service_options',
        option_value: JSON.stringify(service_options)
      });
    }

    // Reducir stock si hay variante
    if (variant_id) {
      await ServiceInventory.decrement('quantity', {
        where: { id: variant_id }
      });
    }

    // Obtener la orden completa
    const completeOrder = await ServiceOrder.findOne({
      where: { id: order.id },
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'base_price']
        },
        {
          model: ServiceInventory,
          as: 'variant',
          attributes: ['id', 'variant_name', 'price_modifier']
        },
        {
          model: ServiceOrderItem,
          as: 'items'
        }
      ]
    });

    res.status(201).json(completeOrder);
  } catch (error) {
    console.error('Error al crear orden de servicio:', error);
    res.status(500).json({ message: 'Error al crear la orden de servicio', error: error.message });
  }
};

// Obtener todas las órdenes (para admin)
exports.getAllServiceOrders = async (req, res) => {
  try {
    const orders = await ServiceOrder.findAll({
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
        },
        {
          model: ServiceOrderItem,
          as: 'items'
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ message: 'Error al obtener las órdenes', error: error.message });
  }
};

// Obtener una orden específica
exports.getServiceOrderById = async (req, res) => {
  try {
    const order = await ServiceOrder.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'base_price']
        },
        {
          model: ServiceInventory,
          as: 'variant',
          attributes: ['id', 'variant_name', 'price_modifier']
        },
        {
          model: ServiceOrderItem,
          as: 'items'
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({ message: 'Error al obtener la orden', error: error.message });
  }
};

// Actualizar estado de una orden
exports.updateServiceOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const order = await ServiceOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    await order.update({ status });

    res.json(order);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error al actualizar el estado', error: error.message });
  }
};

// Obtener órdenes por email del cliente
exports.getOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const orders = await ServiceOrder.findAll({
      where: { customer_email: email },
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

    res.json(orders);
  } catch (error) {
    console.error('Error al obtener órdenes por email:', error);
    res.status(500).json({ message: 'Error al obtener las órdenes', error: error.message });
  }
}; 