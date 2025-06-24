const { Cup, InventoryCups, PrecioCupRango, sequelize } = require('../models');

module.exports = {
  async create(req, res) {
    const t = await sequelize.transaction();
    try {
      const { name, descripcion, stock, precio_base } = req.body;
      if (!name || !descripcion || stock == null || precio_base == null) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }
      // Crear taza
      const cup = await Cup.create({ name, descripcion }, { transaction: t });
      // Crear inventario
      const inventario = await InventoryCups.create({ id_cup: cup.id, stock, reserved_quantity: 0 }, { transaction: t });
      // Crear precio base (rango 1-1)
      const precio = await PrecioCupRango.create({ id_cup: cup.id, min_cantidad: 1, max_cantidad: 1, precio_unitario: precio_base }, { transaction: t });
      await t.commit();
      res.status(201).json({ cup, inventario, precio });
    } catch (err) {
      await t.rollback();
      console.log(err)
      res.status(400).json({ error: err.message });
    }
  },
  async findAll(req, res) {
    try {
      const cups = await Cup.findAll();
      res.json(cups);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async findById(req, res) {
    try {
      const cup = await Cup.findByPk(req.params.id);
      if (!cup) return res.status(404).json({ error: 'No encontrada' });
      res.json(cup);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const cup = await Cup.findByPk(req.params.id);
      if (!cup) return res.status(404).json({ error: 'No encontrada' });
      await cup.update(req.body);
      res.json(cup);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const cup = await Cup.findByPk(req.params.id);
      if (!cup) return res.status(404).json({ error: 'No encontrada' });
      await cup.destroy();
      res.json({ message: 'Eliminada correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}; 