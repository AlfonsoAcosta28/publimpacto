const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItemCup = sequelize.define('OrderItemCup', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'orders', key: 'id' }
  },
  id_cup: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'cups', key: 'id' }
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  precio_unitario: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'orden_item_cup',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = OrderItemCup; 