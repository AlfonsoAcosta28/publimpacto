const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PrecioCupRango = sequelize.define('PrecioCupRango', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cup: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'cups', key: 'id' }
  },
  min_cantidad: { type: DataTypes.INTEGER, allowNull: false },
  max_cantidad: { type: DataTypes.INTEGER, allowNull: false },
  precio_unitario: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'precio_cups_rango',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = PrecioCupRango; 