const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Talla = sequelize.define('Talla', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_camisa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'camisas', key: 'id' }
  },
  talla: { type: DataTypes.STRING, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'tallas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = Talla; 