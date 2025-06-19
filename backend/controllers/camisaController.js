const { Camisa } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const camisa = await Camisa.create(req.body);
      res.status(201).json(camisa);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async findAll(req, res) {
    try {
      const camisas = await Camisa.findAll();
      res.json(camisas);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async findById(req, res) {
    try {
      const camisa = await Camisa.findByPk(req.params.id);
      if (!camisa) return res.status(404).json({ error: 'No encontrada' });
      res.json(camisa);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const camisa = await Camisa.findByPk(req.params.id);
      if (!camisa) return res.status(404).json({ error: 'No encontrada' });
      await camisa.update(req.body);
      res.json(camisa);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const camisa = await Camisa.findByPk(req.params.id);
      if (!camisa) return res.status(404).json({ error: 'No encontrada' });
      await camisa.destroy();
      res.json({ message: 'Eliminada correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}; 