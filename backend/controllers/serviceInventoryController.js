const ServiceInventory = require('../models/ServiceInventory');
const Service = require('../models/Service');

// Obtener inventario de un servicio
exports.getServiceInventory = async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    const inventory = await ServiceInventory.findAll({
      where: {
        service_id: serviceId,
        is_active: true
      },
      order: [['created_at', 'ASC']]
    });

    res.json(inventory);
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ message: 'Error al obtener el inventario', error: error.message });
  }
};

// Agregar item al inventario
exports.addInventoryItem = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { variant_name, quantity, price_modifier } = req.body;

    // Validar que el servicio existe
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    // Validar campos requeridos
    if (!variant_name || quantity === undefined) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos',
        missing: {
          variant_name: !variant_name,
          quantity: quantity === undefined
        }
      });
    }

    const inventoryItem = await ServiceInventory.create({
      service_id: serviceId,
      variant_name: variant_name.trim(),
      quantity: parseInt(quantity),
      price_modifier: price_modifier ? parseFloat(price_modifier) : 0,
      is_active: true
    });

    res.status(201).json(inventoryItem);
  } catch (error) {
    console.error('Error al agregar item al inventario:', error);
    res.status(500).json({ message: 'Error al agregar item al inventario', error: error.message });
  }
};

// Actualizar item del inventario
exports.updateInventoryItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { variant_name, quantity, price_modifier, is_active } = req.body;

    const inventoryItem = await ServiceInventory.findByPk(itemId);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Item de inventario no encontrado' });
    }

    await inventoryItem.update({
      variant_name: variant_name ? variant_name.trim() : inventoryItem.variant_name,
      quantity: quantity !== undefined ? parseInt(quantity) : inventoryItem.quantity,
      price_modifier: price_modifier !== undefined ? parseFloat(price_modifier) : inventoryItem.price_modifier,
      is_active: is_active !== undefined ? is_active : inventoryItem.is_active
    });

    res.json(inventoryItem);
  } catch (error) {
    console.error('Error al actualizar item del inventario:', error);
    res.status(500).json({ message: 'Error al actualizar item del inventario', error: error.message });
  }
};

// Eliminar item del inventario (soft delete)
exports.deleteInventoryItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const inventoryItem = await ServiceInventory.findByPk(itemId);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Item de inventario no encontrado' });
    }

    await inventoryItem.update({ is_active: false });

    res.json({ message: 'Item de inventario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar item del inventario:', error);
    res.status(500).json({ message: 'Error al eliminar item del inventario', error: error.message });
  }
};

// Obtener todos los inventarios
exports.getAllInventories = async (req, res) => {
  try {
    const inventories = await ServiceInventory.findAll({
      include: [{
        model: Service,
        as: 'service',
        attributes: ['id', 'name']
      }],
      where: {
        is_active: true
      },
      order: [['created_at', 'ASC']]
    });

    res.json(inventories);
  } catch (error) {
    console.error('Error al obtener inventarios:', error);
    res.status(500).json({ message: 'Error al obtener los inventarios', error: error.message });
  }
}; 