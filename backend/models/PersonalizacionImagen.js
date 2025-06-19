const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PersonalizacionImagen = sequelize.define('PersonalizacionImagen', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_orden_item_camisa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'orden_item_camisa', key: 'id' }
  },
  img_url: { type: DataTypes.STRING, allowNull: false },
  posicion: { type: DataTypes.STRING, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'personalizacion_imagen',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['id_orden_item_camisa', 'posicion']
    }
  ]
});

module.exports = PersonalizacionImagen; 