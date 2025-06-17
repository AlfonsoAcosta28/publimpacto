const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const { Op, literal } = require('sequelize');
const { sequelize } = require('../models');



exports.getAllInventory = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, lowStock, product_id } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        if (product_id) {
            whereClause.product_id = product_id;
        }

        if (lowStock === 'true') {
            whereClause = {
                ...whereClause,
                [Op.and]: [
                    literal('stock_quantity <= min_stock_level')
                ]
            };
        }

        const inventory = await Inventory.findAndCountAll({
            where: whereClause,
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'title', 'base_price', 'category_id']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['updated_at', 'DESC']]
        });

        res.json({
            success: true,
            data: inventory.rows,
            pagination: {
                total: inventory.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(inventory.count / limit)
            }
        });
    } catch (error) {
        console.error('Error en getAllInventory:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el inventario',
            error: error.message
        });
    }
}


// Obtener inventario por ID
exports.getInventoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const inventory = await Inventory.findByPk(id, {
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'title', 'description', 'base_price', 'category_id']
            }]
        });

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Registro de inventario no encontrado'
            });
        }

        res.json({
            success: true,
            data: inventory
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Error al obtener el registro de inventario',
            error: error.message
        });
    }
}
exports.createInventory = async (req, res) => {
    console.log("\nINVENTARIO: ")
    console.log(req.body)
    try {
        const {
            product_id,
            stock_quantity,
            reserved_quantity = 0,
            min_stock_level = 10,
            cost_per_unit,
            status = 'active',
            notes
        } = req.body;

        // Verificar que el producto existe
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Verificar que no existe ya un registro de inventario para este producto
        const existingInventory = await Inventory.findOne({ where: { product_id } });
        if (existingInventory) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un registro de inventario para este producto'
            });
        }

        const newInventory = await Inventory.create({
            product_id,
            stock_quantity,
            reserved_quantity,
            min_stock_level,
            cost_per_unit,
            status,
            notes,
            last_movement_date: new Date()
        });

        const inventoryWithProduct = await Inventory.findByPk(newInventory.id, {
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'title', 'base_price']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Registro de inventario creado exitosamente',
            data: inventoryWithProduct
        });
    } catch (error) {
        // console.log(error)
        res.status(500).json({
            success: false,
            message: 'Error al crear el registro de inventario',
            error: error.message
        });
    }
};
// Actualizar inventario
exports.updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Registro de inventario no encontrado'
            });
        }

        await inventory.update(updateData);

        const updatedInventory = await Inventory.findByPk(id, {
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'title', 'base_price']
            }]
        });

        res.json({
            success: true,
            message: 'Inventario actualizado exitosamente',
            data: updatedInventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el inventario',
            error: error.message
        });
    }
}
// Ajustar stock (entrada o salida)
exports.adjustStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, type, notes } = req.body;

        if (!quantity || !type) {
            return res.status(400).json({
                success: false,
                message: 'Cantidad y tipo de movimiento son requeridos'
            });
        }

        if (!['in', 'out'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de movimiento debe ser "in" o "out"'
            });
        }

        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Registro de inventario no encontrado'
            });
        }

        let newQuantity;
        if (type === 'in') {
            newQuantity = inventory.stock_quantity + parseInt(quantity);
        } else {
            newQuantity = inventory.stock_quantity - parseInt(quantity);
            if (newQuantity < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No hay suficiente stock disponible'
                });
            }
        }

        await inventory.update({
            stock_quantity: newQuantity,
            last_movement_date: new Date(),
            notes: notes || inventory.notes
        });

        const updatedInventory = await Inventory.findByPk(id, {
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'title', 'base_price']
            }]
        });

        res.json({
            success: true,
            message: `Stock ${type === 'in' ? 'agregado' : 'reducido'} exitosamente`,
            data: updatedInventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al ajustar el stock',
            error: error.message
        });
    }
}

// Reservar stock
exports.reserveStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Registro de inventario no encontrado'
            });
        }

        const availableQuantity = inventory.stock_quantity - inventory.reserved_quantity;
        if (quantity > availableQuantity) {
            return res.status(400).json({
                success: false,
                message: 'No hay suficiente stock disponible para reservar'
            });
        }

        await inventory.update({
            reserved_quantity: inventory.reserved_quantity + parseInt(quantity)
        });

        res.json({
            success: true,
            message: 'Stock reservado exitosamente',
            data: inventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al reservar stock',
            error: error.message
        });
    }
}

// Obtener productos con stock bajo
exports.getLowStockItems = async (req, res) => {
    try {
        const lowStockItems = await Inventory.findAll({
            where: {
                [Op.and]: [
                    { stock_quantity: { [Op.lte]: sequelize.col('min_stock_level') } },
                    { status: 'active' }
                ]
            },
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'title', 'base_price']
            }],
            order: [['stock_quantity', 'ASC']]
        });

        res.json({
            success: true,
            message: `Se encontraron ${lowStockItems.length} productos con stock bajo`,
            data: lowStockItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos con stock bajo',
            error: error.message
        });
    }
}

// Eliminar registro de inventario
exports.deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;

        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Registro de inventario no encontrado'
            });
        }

        await inventory.destroy();

        res.json({
            success: true,
            message: 'Registro de inventario eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el registro de inventario',
            error: error.message
        });
    }
}

// Cambiar estado del inventario
exports.changeInventoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive', 'discontinued'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Estado inválido. Debe ser active, inactive o discontinued'
            });
        }

        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Registro de inventario no encontrado'
            });
        }

        await inventory.update({ status });

        const updatedInventory = await Inventory.findByPk(id, {
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'title', 'base_price']
            }]
        });

        res.json({
            success: true,
            message: 'Estado del inventario actualizado exitosamente',
            data: updatedInventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del inventario',
            error: error.message
        });
    }
}

// Liberar stock reservado
exports.releaseStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Registro de inventario no encontrado'
            });
        }

        if (quantity > inventory.reserved_quantity) {
            return res.status(400).json({
                success: false,
                message: 'No hay suficiente stock reservado para liberar'
            });
        }

        await inventory.update({
            reserved_quantity: inventory.reserved_quantity - parseInt(quantity)
        });

        res.json({
            success: true,
            message: 'Stock liberado exitosamente',
            data: inventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al liberar stock',
            error: error.message
        });
    }
}

