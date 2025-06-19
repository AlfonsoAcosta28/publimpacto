const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Color = sequelize.define('Color', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_camisa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'camisas', key: 'id' }
  },
  nombre_color: { type: DataTypes.STRING, allowNull: false },
  rgb: { type: DataTypes.STRING(7), allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'colores',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = Color; 