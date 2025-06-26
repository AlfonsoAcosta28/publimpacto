const FinalQuote = require('../models/FinalQuote');
const QuoteRequest = require('../models/QuoteRequest');

const finalQuoteController = {
  // Crear una cotización final
  async create(req, res) {
    console.log(req.body)
  
    try {
      const finalQuote = await FinalQuote.create(req.body);
      await QuoteRequest.update(
        { status: 'finalizado' },
        { where: { id: req.body.quote_requests_id } }
      );
      res.status(201).json(finalQuote);
      
    } catch (error) {
      console.error('Error creating final quote:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Obtener todas las cotizaciones finales
  async findAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;
      const { count, rows } = await FinalQuote.findAndCountAll({
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
      res.status(500).json({ error: 'Error fetching final quotes' });
    }
  },

  // Obtener por ID
  async findById(req, res) {
    try {
      const finalQuote = await FinalQuote.findByPk(req.params.id);
      if (!finalQuote) return res.status(404).json({ error: 'Final quote not found' });
      res.json(finalQuote);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching final quote' });
    }
  },

  // Actualizar cotización final
  async update(req, res) {
    try {
      const updated = await FinalQuote.update(req.body, {
        where: { id: req.params.id }
      });
      res.json({ message: 'Final quote updated', updated });
    } catch (error) {
      res.status(500).json({ error: 'Error updating final quote' });
    }
  },

  // Eliminar (soft delete)
  async delete(req, res) {
    try {
      const result = await FinalQuote.destroy({
        where: { id: req.params.id }
      });
      res.json({ message: 'Final quote deleted', result });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting final quote' });
    }
  }
};

module.exports = finalQuoteController;
