const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuoteRequest = sequelize.define('QuoteRequest', {
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
    phone:{
        type: DataTypes.STRING(10),
        allowNull: false
    },
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'services',
            key: 'id'
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dimensions:{
        type: DataTypes.STRING(50),
        allowNull: true
    },
    colors:{
        type: DataTypes.STRING(50),
        allowNull: true
    },
    desired_delivery_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pendiente', 'procesando', 'finalizado', 'cancelado'),
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
    tableName: 'quote_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
});

module.exports = QuoteRequest;