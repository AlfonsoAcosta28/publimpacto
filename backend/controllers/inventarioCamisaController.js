const { InventarioCamisa, Camisa, Talla, Color } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const inventario = await InventarioCamisa.create(req.body);
      res.status(201).json(inventario);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async findAll(req, res) {
    try {
      const inventarios = await InventarioCamisa.findAll({
        include: [
          { 
            model: Camisa, 
            as: 'camisa',
            where: { activo: true },
            required: true
          },
          { model: Talla, as: 'talla' },
          { model: Color, as: 'color' }
        ]
      });
      res.json(inventarios);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async findById(req, res) {
    try {
      const inventario = await InventarioCamisa.findByPk(req.params.id, {
        include: [
          { 
            model: Camisa, 
            as: 'camisa',
            where: { activo: true },
            required: true
          },
          { model: Talla, as: 'talla' },
          { model: Color, as: 'color' }
        ]
      });
      if (!inventario) return res.status(404).json({ error: 'No encontrado' });
      res.json(inventario);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const inventario = await InventarioCamisa.findByPk(req.params.id);
      if (!inventario) return res.status(404).json({ error: 'No encontrado' });
      await inventario.update(req.body);
      res.json(inventario);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const inventario = await InventarioCamisa.findByPk(req.params.id);
      if (!inventario) return res.status(404).json({ error: 'No encontrado' });
      await inventario.destroy();
      res.json({ message: 'Eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async entradaStock(req, res) {
    try {
      const { cantidad } = req.body;
      if (typeof cantidad !== 'number' || cantidad <= 0) return res.status(400).json({ error: 'Cantidad inválida' });
      const inventario = await InventarioCamisa.findByPk(req.params.id);
      if (!inventario) return res.status(404).json({ error: 'No encontrado' });
      inventario.stock += cantidad;
      await inventario.save();
      res.json(inventario);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async salidaStock(req, res) {
    try {
      const { cantidad } = req.body;
      if (typeof cantidad !== 'number' || cantidad <= 0) return res.status(400).json({ error: 'Cantidad inválida' });
      const inventario = await InventarioCamisa.findByPk(req.params.id);
      if (!inventario) return res.status(404).json({ error: 'No encontrado' });
      if (inventario.stock - cantidad < 0) return res.status(400).json({ error: 'No hay suficiente stock' });
      inventario.stock -= cantidad;
      await inventario.save();
      res.json(inventario);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}; 