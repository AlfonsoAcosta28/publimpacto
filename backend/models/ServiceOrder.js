const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceOrder = sequelize.define('ServiceOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id'
    }
  },
  // variant_id: {
  //   type: DataTypes.INTEGER,
  //   allowNull: true,
  //   references: {
  //     model: 'service_inventory',
  //     key: 'id'
  //   }
  // },
  status: {
    type: DataTypes.ENUM('pending', 'reviewing', 'quoted', 'accepted', 'rejected', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  service_options: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON string con las opciones seleccionadas del servicio'
  },
  estimated_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio estimado por el cliente'
  },
  final_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio final cotizado por el administrador'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Cantidad solicitada'
  },
  delivery_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de entrega deseada'
  },
  special_requirements: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Requerimientos especiales del cliente'
  },
  admin_comments: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Comentarios del administrador sobre la cotización'
  }
}, {
  tableName: 'service_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ServiceOrder; 