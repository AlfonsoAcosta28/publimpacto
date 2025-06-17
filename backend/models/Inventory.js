const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
//   Cantidad total actual en inventario (cantidad física almacenada). No puede ser negativa.
  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
//   Cantidad del stock que ya está reservada (ej: para pedidos en curso).
  reserved_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
//   Campo virtual (no se guarda en BD). Calculado automáticamente: stock_quantity - reserved_quantity. Útil para saber cuánto se puede vender.
  available_quantity: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.stock_quantity - this.reserved_quantity;
    }
  },
//   Nivel mínimo de stock recomendado. Sirve para alertas de reabastecimiento.
  min_stock_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    validate: {
      min: 0
    }
  },

// 	Fecha del último movimiento en el inventario (entrada o salida de stock). Se actualiza automáticamente si cambia el stock.
  last_movement_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
//   Costo por unidad del producto almacenado (útil para reportes financieros).
  cost_per_unit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'discontinued'),
    allowNull: false,
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  }
}, {
  tableName: 'inventory',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  hooks: {
    beforeUpdate: (inventory, options) => {
      // Actualizar fecha del último movimiento cuando cambie el stock
      if (inventory.changed('stock_quantity') || inventory.changed('reserved_quantity')) {
        inventory.last_movement_date = new Date();
      }
    }
  }
});

// Add associations
Inventory.associate = (models) => {
  Inventory.belongsTo(models.Product, {
    foreignKey: 'product_id',
    as: 'product'
  });
  
  Inventory.hasMany(models.InventoryMovement, {
    foreignKey: 'inventory_id',
    as: 'movements'
  });
};

module.exports = Inventory;