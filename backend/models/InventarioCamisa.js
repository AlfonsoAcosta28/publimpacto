const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventarioCamisa = sequelize.define('InventarioCamisa', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_camisa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'camisas', key: 'id' }
  },
  id_talla: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'tallas', key: 'id' }
  },
  id_color: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'colores', key: 'id' }
  },
  // stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
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
  tableName: 'inventario_camisa',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['id_camisa', 'id_talla', 'id_color']
    }
  ]
});

module.exports = InventarioCamisa; 