const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenCamisa = sequelize.define('OrdenCamisa', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  address_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'addresses', key: 'id' }
  },
  telefono_contacto: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  envio: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  total: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  status: {
    type: DataTypes.ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'),
    defaultValue: 'pendiente',
    allowNull: false
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'orden_camisa',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = OrdenCamisa; 