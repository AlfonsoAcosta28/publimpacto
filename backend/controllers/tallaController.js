const { Talla } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const talla = await Talla.create(req.body);
      res.status(201).json(talla);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async findAll(req, res) {
    try {
      const tallas = await Talla.findAll();
      res.json(tallas);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async findById(req, res) {
    try {
      const talla = await Talla.findByPk(req.params.id);
      if (!talla) return res.status(404).json({ error: 'No encontrada' });
      res.json(talla);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const talla = await Talla.findByPk(req.params.id);
      if (!talla) return res.status(404).json({ error: 'No encontrada' });
      await talla.update(req.body);
      res.json(talla);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const talla = await Talla.findByPk(req.params.id);
      if (!talla) return res.status(404).json({ error: 'No encontrada' });
      await talla.destroy();
      res.json({ message: 'Eliminada correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}; 