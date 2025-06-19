const { OrdenCamisa } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const orden = await OrdenCamisa.create(req.body);
      res.status(201).json(orden);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async findAll(req, res) {
    try {
      const ordenes = await OrdenCamisa.findAll();
      res.json(ordenes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async findById(req, res) {
    try {
      const orden = await OrdenCamisa.findByPk(req.params.id);
      if (!orden) return res.status(404).json({ error: 'No encontrada' });
      res.json(orden);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const orden = await OrdenCamisa.findByPk(req.params.id);
      if (!orden) return res.status(404).json({ error: 'No encontrada' });
      await orden.update(req.body);
      res.json(orden);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const orden = await OrdenCamisa.findByPk(req.params.id);
      if (!orden) return res.status(404).json({ error: 'No encontrada' });
      await orden.destroy();
      res.json({ message: 'Eliminada correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}; 