const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceImage = sequelize.define('ServiceImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id'
    }
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'service_images',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = ServiceImage;