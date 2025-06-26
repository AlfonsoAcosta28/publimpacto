const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FinalQuote = sequelize.define('FinalQuote', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quote_requests_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'quote_requests',
            key: 'id'
        }
    },
    addresses_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'addresses',
            key: 'id'
        }
    },
    // Fecha acordada de entrega
    final_delivery_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    final_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'),
        defaultValue: 'pendiente',
        allowNull: false
    },
    payment_status: {
        type: DataTypes.ENUM('pendiente', 'pagado'),
        defaultValue: 'pendiente',
        allowNull: false
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'final_quote',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
});

module.exports = FinalQuote; 