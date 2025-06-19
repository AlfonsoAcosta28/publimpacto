const { Color } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const color = await Color.create(req.body);
      res.status(201).json(color);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async findAll(req, res) {
    try {
      const colores = await Color.findAll();
      res.json(colores);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async findById(req, res) {
    try {
      const color = await Color.findByPk(req.params.id);
      if (!color) return res.status(404).json({ error: 'No encontrado' });
      res.json(color);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const color = await Color.findByPk(req.params.id);
      if (!color) return res.status(404).json({ error: 'No encontrado' });
      await color.update(req.body);
      res.json(color);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const color = await Color.findByPk(req.params.id);
      if (!color) return res.status(404).json({ error: 'No encontrado' });
      await color.destroy();
      res.json({ message: 'Eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}; 