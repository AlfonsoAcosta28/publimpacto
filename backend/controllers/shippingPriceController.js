const ShippingPrice = require('../models/shippingPrice');
const { Op } = require('sequelize');

// Obtener todos los precios de envío (historial)
// exports.getAllShippingPrices = async (req, res) => {
//   try {
//     const prices = await ShippingPrice.findAll({
//       order: [['created_at', 'DESC']]
//     });
    
//     res.json({
//       success: true,
//       data: prices
//     });
//   } catch (error) {
//     console.error('Error al obtener precios de envío:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error al obtener precios de envío',
//       error: error.message
//     });
//   }
// };

// Obtener el precio de envío actual
exports.getCurrentShippingPrice = async (req, res) => {
  try {
    const currentPrice = await ShippingPrice.getCurrentPrice();
    
    if (!currentPrice) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró un precio de envío activo'
      });
    }
    
    res.json({
      success: true,
      data: {
        valorEnvio: currentPrice.valorEnvio,
        precioMinimoVenta: currentPrice.precioMinimoVenta
      }
    });
  } catch (error) {
    console.error('Error al obtener precio de envío actual:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener precio de envío actual',
      error: error.message
    });
  }
};

// Obtener precio de envío para una orden específica
exports.getShippingPriceForOrder = async (req, res) => {
  try {
    const { orderTotal } = req.query;
    
    if (!orderTotal || isNaN(parseFloat(orderTotal))) {
      return res.status(400).json({
        success: false,
        message: 'El total de la orden es requerido y debe ser un número válido'
      });
    }
    
    const shippingInfo = await ShippingPrice.getShippingPriceForOrder(parseFloat(orderTotal));
    
    res.json({
      success: true,
      data: shippingInfo
    });
  } catch (error) {
    console.error('Error al obtener precio de envío para la orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener precio de envío para la orden',
      error: error.message
    });
  }
};

// Crear un nuevo precio de envío
exports.createShippingPrice = async (req, res) => {
  console.log(req.body);
  try {
    const { valorEnvio, precioMinimoVenta } = req.body;
    
    if (valorEnvio === undefined) {
      return res.status(400).json({
        success: false,
        message: 'El valor de envío es requerido'
      });
    }
    
    if (precioMinimoVenta === undefined) {
      return res.status(400).json({
        success: false,
        message: 'El precio mínimo de venta es requerido'
      });
    }
    
    // Validar que los valores sean números positivos
    if (isNaN(parseFloat(valorEnvio)) || parseFloat(valorEnvio) < 0) {
      return res.status(400).json({
        success: false,
        message: 'El valor de envío debe ser un número positivo'
      });
    }
    
    if (isNaN(parseFloat(precioMinimoVenta)) || parseFloat(precioMinimoVenta) < 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio mínimo de venta debe ser un número positivo'
      });
    }
    
    // Desactivar todos los precios anteriores
    await ShippingPrice.update(
      { activo: false },
      { where: { activo: true } }
    );
    
    // Crear el nuevo precio activo
    const newPrice = await ShippingPrice.create({
      valorEnvio: parseFloat(valorEnvio),
      precioMinimoVenta: parseFloat(precioMinimoVenta),
      activo: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Precio de envío creado exitosamente',
      data: newPrice
    });
  } catch (error) {
    console.error('Error al crear precio de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear precio de envío',
      error: error.message
    });
  }
};

// Actualizar un precio de envío existente
// exports.updateShippingPrice = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { valorEnvio, precioMinimoVenta, activo } = req.body;
    
//     const price = await ShippingPrice.findByPk(id);
    
//     if (!price) {
//       return res.status(404).json({
//         success: false,
//         message: 'Precio de envío no encontrado'
//       });
//     }
    
//     // Si estamos activando este precio, desactivar los demás
//     if (activo) {
//       await ShippingPrice.update(
//         { activo: false },
//         { where: { id: { [Op.ne]: id }, activo: true } }
//       );
//     }
    
//     // Actualizar el precio
//     await price.update({
//       valorEnvio: valorEnvio !== undefined ? parseFloat(valorEnvio) : price.valorEnvio,
//       precioMinimoVenta: precioMinimoVenta !== undefined ? parseFloat(precioMinimoVenta) : price.precioMinimoVenta,
//       activo: activo !== undefined ? activo : price.activo
//     });
    
//     res.json({
//       success: true,
//       message: 'Precio de envío actualizado exitosamente',
//       data: price
//     });
//   } catch (error) {
//     console.error('Error al actualizar precio de envío:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error al actualizar precio de envío',
//       error: error.message
//     });
//   }
// };

// Eliminar un precio de envío
// exports.deleteShippingPrice = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const price = await ShippingPrice.findByPk(id);
    
//     if (!price) {
//       return res.status(404).json({
//         success: false,
//         message: 'Precio de envío no encontrado'
//       });
//     }
    
//     // No permitir eliminar el único precio activo
//     if (price.activo) {
//       const activePricesCount = await ShippingPrice.count({ where: { activo: true } });
      
//       if (activePricesCount <= 1) {
//         return res.status(400).json({
//           success: false,
//           message: 'No se puede eliminar el único precio activo. Cree otro precio activo primero.'
//         });
//       }
//     }
    
//     await price.destroy();
    
//     res.json({
//       success: true,
//       message: 'Precio de envío eliminado exitosamente'
//     });
//   } catch (error) {
//     console.error('Error al eliminar precio de envío:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error al eliminar precio de envío',
//       error: error.message
//     });
//   }
// };