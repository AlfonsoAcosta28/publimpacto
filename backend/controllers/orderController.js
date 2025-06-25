const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const OrderItemCup = require('../models/OrderItemCup');
const User = require('../models/User');
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Address = require('../models/Address');
const Inventory = require('../models/Inventory');
const InventoryCup = require('../models/inventoryCup');
const Cup = require('../models/Cup');
const PrecioCupRango = require('../models/precioCupRango');
const ShippingPrice = require('../models/shippingPrice');
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

exports.getAllOrders = async (req, res) => {
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const orders = await Order.findAll({
            include: [
                {
                    model: Address,
                    as: 'Address',
                    attributes: [
                        'id', 'nombre', 'calle', 'numero_calle', 'colonia',
                        'ciudad', 'estado', 'codigo_postal',
                        'referencias', 'descripcion_casa', 'horario_preferido'
                    ]
                },
                {
                    model: OrderItem,
                    as: 'OrderItems',
                    include: [
                        {
                            model: Product,
                            as: 'Product',
                            attributes: ['id', 'title'],
                            include: [
                                {
                                    model: ProductImage,
                                    as: 'ProductImages',
                                    attributes: ['image_url'],
                                    where: { is_primary: true },
                                    required: false
                                }
                            ]
                        }
                    ]
                },
                {
                    model: OrderItemCup,
                    as: 'OrderItemCups',
                    include: [
                        {
                            model: Cup,
                            as: 'Cup',
                            attributes: ['id', 'name', 'descripcion']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        const transformedOrders = orders.map(order => {
            const orderJSON = order.toJSON();

            return {
                id: orderJSON.id,
                user_id: orderJSON.user_id,
                address_id: orderJSON.address_id,
                total: orderJSON.total,
                status: orderJSON.status,
                telefono_contacto: orderJSON.telefono_contacto,
                created_at: orderJSON.created_at,
                updated_at: orderJSON.updated_at,
                deleted_at: orderJSON.deleted_at,
                envio: orderJSON.envio,
                activo: orderJSON.activo,

                address: orderJSON.Address,
                products: orderJSON.OrderItems.map(item => ({
                    id: item.id,
                    product_id: item.product_id,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario,
                    product: {
                        id: item.Product.id,
                        title: item.Product.title,
                        image: item.Product.ProductImages[0]?.image_url
                            ? `${baseUrl}${item.Product.ProductImages[0].image_url}`
                            : '/placeholder.png'
                    }
                })),
                cups: orderJSON.OrderItemCups.map(cupItem => ({
                    id: cupItem.id,
                    id_order: cupItem.id_order,
                    id_cup: cupItem.id_cup,
                    image_url: `${baseUrl}${cupItem.image_url}`,
                    cantidad: cupItem.cantidad,
                    precio_unitario: cupItem.precio_unitario,
                    subtotal: cupItem.subtotal,
                    cup: cupItem.Cup
                }))
            };
        });

        res.json(transformedOrders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
    }
};


exports.getOrderById = async (req, res) => {
    try {
        // Obtener la URL base
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const order = await Order.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'nombre', 'correo', 'telefono']
                },
                {
                    model: Address,
                    as: 'Address',
                    attributes: [
                        'id', 'nombre', 'calle', 'numero_calle', 'colonia',
                        'ciudad', 'estado', 'codigo_postal',
                        'referencias', 'descripcion_casa', 'horario_preferido'
                    ]
                },
                {
                    model: OrderItem,
                    as: 'OrderItems',
                    include: [
                        {
                            model: Product,
                            as: 'Product',
                            attributes: ['id', 'title', 'price'],
                            include: [
                                {
                                    model: ProductImage,
                                    as: 'ProductImages',
                                    attributes: ['image_url'],
                                    where: { is_primary: true },
                                    required: false
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        // Check if user is allowed to see this order
        if (req.user.role === 'user' && order.user_id !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permiso para ver este pedido' });
        }

        // Transformar la respuesta para incluir la imagen en el formato esperado
        const transformedOrder = {
            ...order.toJSON(),
            user: order.User,
            address: order.Address,
            items: order.OrderItems.map(item => ({
                id: item.id,
                product_id: item.product_id,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                product: {
                    id: item.Product.id,
                    title: item.Product.title,
                    price: item.Product.price,
                    image: item.Product.ProductImages[0]?.image_url
                        ? `${baseUrl}${item.Product.ProductImages[0].image_url}`
                        : '/placeholder.png'
                }
            }))
        };

        res.json(transformedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el pedido', error: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        const offset = (page - 1) * limit;
        
        // Obtener la URL base
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        // Get total count for pagination
        const totalOrders = await Order.count({
            where: { user_id: userId }
        });

        const orders = await Order.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Address,
                    as: 'Address',
                    attributes: [
                        'id', 'nombre', 'calle', 'numero_calle', 'colonia',
                        'ciudad', 'estado', 'codigo_postal',
                        'referencias', 'descripcion_casa', 'horario_preferido'
                    ]
                },
                {
                    model: OrderItem,
                    as: 'OrderItems',
                    include: [
                        {
                            model: Product,
                            as: 'Product',
                            attributes: ['id', 'title'],
                            include: [
                                {
                                    model: ProductImage,
                                    as: 'ProductImages',
                                    attributes: ['image_url'],
                                    where: { is_primary: true },
                                    required: false
                                }
                            ]
                        }
                    ]
                },
                {
                    model: OrderItemCup,
                    as: 'OrderItemCups',
                    include: [
                        {
                            model: Cup,
                            as: 'Cup',
                            attributes: ['id', 'name', 'descripcion']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']],
            limit: limit,
            offset: offset
        });

        // Transformar la respuesta para incluir productos y tazas en el mismo array
        const transformedOrders = orders.map(order => {
            // Productos normales
            const productItems = (order.OrderItems || []).map(item => ({
                type: 'product',
                id: item.id,
                product_id: item.product_id,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                product: {
                    id: item.Product.id,
                    title: item.Product.title,
                    image: item.Product.ProductImages[0]?.image_url
                        ? `${baseUrl}${item.Product.ProductImages[0].image_url}`
                        : '/placeholder.png'
                }
            }));
            // Tazas personalizadas
            const cupItems = (order.OrderItemCups || []).map(item => ({
                type: 'cup',
                id: item.id,
                cup_id: item.id_cup,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                image: item.image_url ? `${baseUrl}${item.image_url}` : '/placeholder.png',
                cup: item.Cup ? {
                    id: item.Cup.id,
                    name: item.Cup.name,
                    descripcion: item.Cup.descripcion
                } : null
            }));
            // Unimos ambos arrays
            const allItems = [...productItems, ...cupItems];
            return {
                ...order.toJSON(),
                address: order.Address ? {
                    id: order.Address.id,
                    nombre: order.Address.nombre,
                    calle: order.Address.calle || '',
                    numero_calle: order.Address.numero_calle || '',
                    colonia: order.Address.colonia || '',
                    ciudad: order.Address.ciudad || '',
                    estado: order.Address.estado || '',
                    codigo_postal: order.Address.codigo_postal || '',
                    referencias: order.Address.referencias || '',
                    descripcion_casa: order.Address.descripcion_casa || '',
                    horario_preferido: order.Address.horario_preferido || ''
                } : null,
                items: allItems
            };
        });

        const totalPages = Math.ceil(totalOrders / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            orders: transformedOrders,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalOrders: totalOrders,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage,
                limit: limit
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error al obtener los pedidos del usuario', error: error.message });
    }
};

exports.createOrderCup = async (req, res) => {
    console.log("body 1 ", req.body);
    console.log("files ", req.files);
    const transaction = await sequelize.transaction();

    try {
        const userId = req.user.id;
        
        // Parsear los datos JSON del FormData
        const items = JSON.parse(req.body.items);
        const address_id = parseInt(req.body.address_id);
        const telefono_contacto = req.body.telefono_contacto;

        if (!items || !Array.isArray(items) || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Debe proporcionar al menos una taza para el pedido' });
        }

        if (!req.files || !req.files['cupImage']) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Debe proporcionar la imagen personalizada' });
        }

        if (!address_id) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Debe proporcionar una dirección de entrega' });
        }

        // Verificar que la dirección exista y pertenezca al usuario
        const address = await Address.findOne({
            where: {
                id: address_id,
                user_id: userId
            }
        });

        if (!address) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Dirección de entrega no encontrada o no pertenece al usuario' });
        }

        // Validate and get cups
        const cupIds = items.map(item => item.id_cup);
        const cups = await Cup.findAll({
            where: { id: cupIds }
        });

        if (cups.length !== cupIds.length) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Algunas tazas no existen' });
        }

        // Verificar disponibilidad en inventario
        const inventoryItems = await InventoryCup.findAll({
            where: { id_cup: cupIds }
        });

        for (const item of items) {
            const inventory = inventoryItems.find(inv => inv.id_cup === item.id_cup);
            if (!inventory) {
                await transaction.rollback();
                return res.status(400).json({ message: `No hay inventario disponible para la taza ID: ${item.id_cup}` });
            }

            const availableQuantity = inventory.stock - inventory.reserved_quantity;
            if (availableQuantity < item.cantidad) {
                await transaction.rollback();
                return res.status(400).json({ message: `Stock insuficiente para la taza ID: ${item.id_cup}. Disponible: ${availableQuantity}, Solicitado: ${item.cantidad}` });
            }
        }

        // Calculate subtotal
        let subtotal = 0;
        for (const item of items) {
            // Obtener precio según rango de cantidad
            const precioRango = await PrecioCupRango.findOne({
                where: {
                    id_cup: item.id_cup,
                    min_cantidad: { [Op.lte]: item.cantidad },
                    max_cantidad: { [Op.gte]: item.cantidad }
                }
            });

            let precioUnitario = 15.99; // Precio base por defecto
            if (precioRango) {
                precioUnitario = parseFloat(precioRango.precio_unitario);
            }

            subtotal += precioUnitario * item.cantidad;
        }

        // Calculate shipping
        const shippingConfig = await ShippingPrice.findOne({ 
            where: { activo: true },
            order: [['created_at', 'DESC']],
            transaction 
        });
        let shippingCost = 0;
        if (shippingConfig) {
            const freeShippingMin = parseFloat(shippingConfig.precioMinimoVenta);
            if (subtotal < freeShippingMin) {
                shippingCost = parseFloat(shippingConfig.valorEnvio);
            }
        }

        const total = subtotal + shippingCost;

        // Create order
        const order = await Order.create({
            user_id: userId,
            address_id,
            total: total,
            envio: shippingCost,
            status: 'pendiente',
            telefono_contacto: telefono_contacto || address.telefono_contacto
        }, { transaction });

        // Obtener la URL de la imagen subida (solo después de validar todo)
        const imageUrl = `/uploads/cups/${req.files['cupImage'][0].filename}`;

        // Create order items and update inventory
        const orderItems = [];
        for (const item of items) {
            // Obtener precio según rango de cantidad
            const precioRango = await PrecioCupRango.findOne({
                where: {
                    id_cup: item.id_cup,
                    min_cantidad: { [Op.lte]: item.cantidad },
                    max_cantidad: { [Op.gte]: item.cantidad }
                }
            });

            let precioUnitario = 15.99; // Precio base por defecto
            if (precioRango) {
                precioUnitario = parseFloat(precioRango.precio_unitario);
            }

            const subtotalItem = precioUnitario * item.cantidad;
            
            const orderItem = await OrderItemCup.create({
                id_order: order.id,
                id_cup: item.id_cup,
                image_url: imageUrl,
                cantidad: item.cantidad,
                precio_unitario: precioUnitario,
                subtotal: subtotalItem
            }, { transaction });

            orderItems.push(orderItem);

            // Update reserved quantity in inventory
            const inventory = inventoryItems.find(inv => inv.id_cup === item.id_cup);
            await inventory.increment('reserved_quantity', { 
                by: item.cantidad,
                transaction 
            });
        }

        await transaction.commit();

        res.status(201).json({
            message: 'Pedido de taza personalizada creado exitosamente',
            order: {
                ...order.toJSON(),
                items: orderItems
            }
        });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Error al crear el pedido de taza personalizada', error: error.message });
        console.log(error);
    }
};

exports.createOrder = async (req, res) => {
    console.log("body 2")
    console.log(req.body)
    const transaction = await sequelize.transaction();

    try {
        const userId = req.user.id;
        const { items, address_id, telefono_contacto } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Debe proporcionar al menos un producto para el pedido' });
        }

        if (!address_id) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Debe proporcionar una dirección de entrega' });
        }

        // Verificar que la dirección exista y pertenezca al usuario
        const address = await Address.findOne({
            where: {
                id: address_id,
                user_id: userId
            }
        });

        if (!address) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Dirección de entrega no encontrada o no pertenece al usuario' });
        }

        // Validate and get products
        const productIds = items.map(item => item.product_id);
        const products = await Product.findAll({
            where: { id: productIds }
        });

        if (products.length !== productIds.length) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Algunos productos no existen' });
        }

        // Verificar disponibilidad en inventario
        const inventoryItems = await Inventory.findAll({
            where: { product_id: productIds }
        });

        for (const item of items) {
            const inventory = inventoryItems.find(inv => inv.product_id === item.product_id);
            if (!inventory) {
                await transaction.rollback();
                return res.status(400).json({ message: `No hay inventario disponible para el producto ID: ${item.product_id}` });
            }

            const availableQuantity = inventory.stock_quantity - inventory.reserved_quantity;
            if (availableQuantity < item.cantidad) {
                await transaction.rollback();
                return res.status(400).json({ message: `Stock insuficiente para el producto ID: ${item.product_id}. Disponible: ${availableQuantity}, Solicitado: ${item.cantidad}` });
            }
        }

        // Calculate subtotal
        let subtotal = 0;
        for (const item of items) {
            const product = products.find(p => p.id === item.product_id);
            let productPrice = parseFloat(product.base_price);
            
            // Apply discount if exists
            if (product.discount_percentage && product.discount_percentage > 0) {
                const discount = productPrice * (parseFloat(product.discount_percentage) / 100);
                productPrice = productPrice - discount;
            }
            
            subtotal += productPrice * item.cantidad;
        }

        // Calculate shipping
        const shippingConfig = await ShippingPrice.findOne({ 
            where: { activo: true },
            order: [['created_at', 'DESC']],
            transaction 
        });
        let shippingCost = 0;
        if (shippingConfig) {
            const freeShippingMin = parseFloat(shippingConfig.precioMinimoVenta);
            if (subtotal < freeShippingMin) {
                shippingCost = parseFloat(shippingConfig.valorEnvio);
            }
        }

        const total = subtotal + shippingCost;

        // Create order
        const order = await Order.create({
            user_id: userId,
            address_id,
            total: total,
            envio: shippingCost,
            status: 'pendiente',
            telefono_contacto: telefono_contacto || address.telefono_contacto
        }, { transaction });

        // Create order items and update inventory
        const orderItems = [];
        for (const item of items) {
            const product = products.find(p => p.id === item.product_id);
            let productPrice = parseFloat(product.base_price);
            
            // Apply discount if exists
            if (product.discount_percentage && product.discount_percentage > 0) {
                const discount = productPrice * (parseFloat(product.discount_percentage) / 100);
                productPrice = productPrice - discount;
            }
            
            const orderItem = await OrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                cantidad: item.cantidad,
                precio_unitario: productPrice
            }, { transaction });

            orderItems.push(orderItem);

            // Update reserved quantity in inventory
            const inventory = inventoryItems.find(inv => inv.product_id === item.product_id);
            await inventory.increment('reserved_quantity', { 
                by: item.cantidad,
                transaction 
            });
        }

        await transaction.commit();

        res.status(201).json({
            message: 'Pedido creado exitosamente',
            order: {
                ...order.toJSON(),
                items: orderItems
            }
        });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Error al crear el pedido', error: error.message });
        console.log(error)
    }
};

exports.updateOrderStatus = async (req, res) => {
    console.log(req.params)
    const transaction = await sequelize.transaction();
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [{
                model: OrderItem,
                as: 'OrderItems'
            }]
        });

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        const { status } = req.body;

        if (!['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'].includes(status)) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Estado no válido' });
        }

        // Si el estado anterior era pendiente o procesando y el nuevo es cancelado
        if (['pendiente', 'procesando'].includes(order.status) && status === 'cancelado') {
            // Liberar el stock reservado
            for (const item of order.OrderItems) {
                const inventory = await Inventory.findOne({
                    where: { product_id: item.product_id }
                });
                if (inventory) {
                    await inventory.update({
                        reserved_quantity: inventory.reserved_quantity - item.cantidad
                    }, { transaction });
                }
            }
        }
        // Si el estado anterior era enviado y el nuevo es entregado
        else if (order.status === 'enviado' && status === 'entregado') {
            // Liberar el stock reservado y reducir el stock total
            for (const item of order.OrderItems) {
                const inventory = await Inventory.findOne({
                    where: { product_id: item.product_id }
                });
                if (inventory) {
                    await inventory.update({
                        stock_quantity: inventory.stock_quantity - item.cantidad,
                        reserved_quantity: inventory.reserved_quantity - item.cantidad
                    }, { transaction });
                }
            }
        }

        await order.update({ status }, { transaction });
        await transaction.commit();

        res.json({
            message: 'Estado del pedido actualizado exitosamente',
            order
        });
    } catch (error) {
        console.log(error)
        await transaction.rollback();
        res.status(500).json({ message: 'Error al actualizar el estado del pedido', error: error.message });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        // Only the user who created the order or admin/staff can cancel it
        if (req.user.role === 'user' && order.user_id !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permiso para cancelar este pedido' });
        }

        // Only allow cancellation of pending or processing orders
        if (!['pendiente', 'procesando'].includes(order.status)) {
            return res.status(400).json({
                message: 'No se puede cancelar el pedido porque ya está en proceso de envío o entregado'
            });
        }

        await order.update({ status: 'cancelado' });

        res.json({
            message: 'Pedido cancelado exitosamente',
            order
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al cancelar el pedido', error: error.message });
    }
};