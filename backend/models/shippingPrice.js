const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShippingPrice = sequelize.define('ShippingPrice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  valorEnvio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0 // Asegura que el valor no sea negativo
    },
    comment: 'Precio del envío en la moneda local'
  },
  precioMinimoVenta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0 // Asegura que el valor no sea negativo
    },
    comment: 'Precio mínimo de venta requerido para aplicar este envío'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica si este precio está actualmente activo'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'shipping_prices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

ShippingPrice.getCurrentPrice = async function() {
  return await this.findOne({
    where: { activo: true },
    order: [['created_at', 'DESC']]
  });
};

// Método para obtener el precio de envío basado en el total de la compra
ShippingPrice.getShippingPriceForOrder = async function(orderTotal) {
  const currentPrice = await this.getCurrentPrice();
  
  if (!currentPrice) {
    throw new Error('No hay precio de envío activo configurado');
  }
  
  // Si el total de la orden es igual o mayor al precio mínimo, el envío podría ser gratis
  // o aplicar alguna lógica especial según tus reglas de negocio
  return {
    shippingPrice: currentPrice.valorEnvio,
    minimumOrderValue: currentPrice.precioMinimoVenta,
    orderTotal: orderTotal,
    meetsMinimum: orderTotal >= currentPrice.precioMinimoVenta
  };
};

module.exports = ShippingPrice;