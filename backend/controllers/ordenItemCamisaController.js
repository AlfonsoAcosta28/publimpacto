const { OrdenItemCamisa } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const item = await OrdenItemCamisa.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async findAll(req, res) {
    try {
      const items = await OrdenItemCamisa.findAll();
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async findById(req, res) {
    try {
      const item = await OrdenItemCamisa.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'No encontrado' });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const item = await OrdenItemCamisa.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'No encontrado' });
      await item.update(req.body);
      res.json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const item = await OrdenItemCamisa.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'No encontrado' });
      await item.destroy();
      res.json({ message: 'Eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}; 