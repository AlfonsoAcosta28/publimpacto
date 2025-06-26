const { User, FinalQuote, Address } = require('../models');
const QuoteRequest = require('../models/QuoteRequest');
const Service = require('../models/Service')

const quoteRequestController = {
    // Crear una nueva solicitud de cotización
    async create(req, res) {
        try {
            const quote = await QuoteRequest.create(req.body);
            res.status(201).json(quote);
        } catch (error) {
            console.error('Error creating quote request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Obtener todas las cotizaciones
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const offset = (page - 1) * limit;
            const { count, rows } = await QuoteRequest.findAndCountAll({
                include: [
                    {
                        model: User,
                        as: 'User',
                        attributes: ['id', 'nombre', 'correo']
                    },
                    {
                        model: Service,
                        as: 'Service',
                        attributes: ['id', 'name', 'base_price']
                    }
                ],
                order: [['id', 'DESC']],
                limit,
                offset
            });
            res.json({
                data: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error fetching quote requests' });
        }
    },

    // Obtener una sola cotización por ID
    async findById(req, res) {
        try {
            const quote = await QuoteRequest.findByPk(req.params.id);
            if (!quote) return res.status(404).json({ error: 'Quote request not found' });
            res.json(quote);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching quote request' });
        }
    },

    // Actualizar cotización
    async update(req, res) {
        try {
            const updated = await QuoteRequest.update(req.body, {
                where: { id: req.params.id }
            });
            res.json({ message: 'Quote request updated', updated });
        } catch (error) {
            res.status(500).json({ error: 'Error updating quote request' });
        }
    },

    // Eliminar (soft-delete si tienes paranoid:true)
    async delete(req, res) {
        try {
            const result = await QuoteRequest.destroy({
                where: { id: req.params.id }
            });
            res.json({ message: 'Quote request deleted', result });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting quote request' });
        }
    },

    // Obtener todas las cotizaciones de un usuario autenticado
    async getUserQuotes(req, res) {
        try {
            const userId = req.user.id;

            const quotes = await QuoteRequest.findAll({
                where: { user_id: userId },
                include: [
                    {
                        model: Service,
                        as: 'Service'
                    },
                    {
                        model: FinalQuote,
                        as: 'final_quote',
                        include: [
                            {
                                model: Address,
                                as: 'address',
                                required: false
                            }
                        ]
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            res.json(quotes);
        } catch (error) {
            console.error('Error fetching user quote requests:', error);
            res.status(500).json({ error: 'Error fetching user quote requests' });
        }
    },
    async getUserQuoteById(req, res) {
        try {
            const userId = req.user.id;
            const quoteId = req.params.id;

            const quotes = await QuoteRequest.findOne({
                where: { id: quoteId, user_id: userId },
                include: [
                    {
                        model: Service,
                        as: 'Service'
                    },
                    {
                        model: FinalQuote,
                        as: 'final_quote',
                        include: [
                            {
                                model: Address,
                                as: 'address',
                                required: false
                            }
                        ]
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            res.json(quotes);
        } catch (error) {
            console.error('Error fetching user quote requests:', error);
            res.status(500).json({ error: 'Error fetching user quote requests' });
        }
    },


    // Cambiar el estado de una cotización
    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const updated = await QuoteRequest.update(
                { status },
                { where: { id: req.params.id } }
            );
            res.json({ message: 'Estado actualizado', updated });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el estado de la cotización' });
        }
    }
};

module.exports = quoteRequestController;
