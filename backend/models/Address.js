// models/Address.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
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
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nombre identificador de la dirección'
  },
  calle: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  numero_calle: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  colonia: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ciudad: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  codigo_postal: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  referencias: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Indicaciones adicionales para encontrar la ubicación'
  },
  descripcion_casa: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Características distintivas de la casa o edificio'
  },
  horario_preferido: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Horario preferido para recibir entregas'
  },
  es_principal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica si es la dirección principal del usuario'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'addresses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

// Define associations
Address.associate = function(models) {
  // Address belongs to User
  Address.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  
  // Address has many Orders
  Address.hasMany(models.Order, {
    foreignKey: 'address_id',
    as: 'orders'
  });
};

module.exports = Address;