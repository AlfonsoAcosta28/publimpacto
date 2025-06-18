const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceOrderItem = sequelize.define('ServiceOrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  service_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'service_orders',
      key: 'id'
    }
  },
  option_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  option_value: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'service_order_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ServiceOrderItem; 