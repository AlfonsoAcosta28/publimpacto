const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Address = require('../models/Address');
const Inventory = require('../models/Inventory');
const ShippingPrice = require('../models/ShippingPrice');
const sequelize = require('../config/database');

exports.getAllOrders = async (req, res) => {
    try {
        // Obtener la URL base
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const orders = await Order.findAll({
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
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Transformar la respuesta para incluir la imagen en el formato esperado
        const transformedOrders = orders.map(order => {
            return {
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
                        image: item.Product.ProductImages[0]?.image_url
                            ? `${baseUrl}${item.Product.ProductImages[0].image_url}`
                            : '/placeholder.png'
                    }
                }))
            };
        });

        res.json(transformedOrders);
    } catch (error) {
        console.log(error)
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
        // Obtener la URL base
        const baseUrl = `${req.protocol}://${req.get('host')}`;

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
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Transformar la respuesta para incluir la imagen en el formato esperado
        const transformedOrders = orders.map(order => ({
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
            items: order.OrderItems.map(item => ({
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
            }))
        }));

        res.json(transformedOrders);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error al obtener los pedidos del usuario', error: error.message });
    }
};

exports.createOrder = async (req, res) => {
    console.log("body ")
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

        // Create order items
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