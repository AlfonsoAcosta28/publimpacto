const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenItemCamisa = sequelize.define('OrdenItemCamisa', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_orden_camisa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'orden_camisa', key: 'id' }
  },
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
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  precio_unitario: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'orden_item_camisa',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = OrdenItemCamisa; 