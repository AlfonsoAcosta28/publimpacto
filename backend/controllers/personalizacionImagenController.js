const { PersonalizacionImagen } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const img = await PersonalizacionImagen.create(req.body);
      res.status(201).json(img);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async findAll(req, res) {
    try {
      const imgs = await PersonalizacionImagen.findAll();
      res.json(imgs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async findById(req, res) {
    try {
      const img = await PersonalizacionImagen.findByPk(req.params.id);
      if (!img) return res.status(404).json({ error: 'No encontrada' });
      res.json(img);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const img = await PersonalizacionImagen.findByPk(req.params.id);
      if (!img) return res.status(404).json({ error: 'No encontrada' });
      await img.update(req.body);
      res.json(img);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const img = await PersonalizacionImagen.findByPk(req.params.id);
      if (!img) return res.status(404).json({ error: 'No encontrada' });
      await img.destroy();
      res.json({ message: 'Eliminada correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}; 