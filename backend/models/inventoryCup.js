const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryCup = sequelize.define('InventoryCup', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cup: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'cups', key: 'id' }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  reserved_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  available_quantity: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.stock - this.reserved_quantity;
    }
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'inventory_cup',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['id_cup']
    }
  ]
});

module.exports = InventoryCup; 