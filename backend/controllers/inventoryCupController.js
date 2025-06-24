const { InventoryCups, Cup } = require('../models');
const { Op, literal, fn, col } = require('sequelize');

module.exports = {
  async create(req, res) {
    try {
      const inventario = await InventoryCups.create(req.body);
      res.status(201).json(inventario);
    } catch (err) {
      res.status(400).json({ error: err.message });
      console.log(err)
    }
  },
  async findAll(req, res) {
    try {
      const inventarios = await InventoryCups.findAll({
        include: [
          { 
            model: Cup, 
            as: 'cup',
            required: true
          },
        ]
      });
      res.json(inventarios);
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: err.message });
    }
  },
  async findAllForUsers(req, res) {
    try {
      const inventarios = await InventoryCups.findAll({
        attributes: [
          'id', 
          'id_cup', 
          'stock',
          'reserved_quantity',
          'created_at', 
          'updated_at'
        ],
        include: [
          { 
            model: Cup, 
            as: 'cup',
            required: true
          },
        ]
      });
      
      // Procesar los datos para filtrar y calcular available_quantity
      const inventariosProcesados = inventarios
        .filter(inv => inv.stock > inv.reserved_quantity) // Solo tazas con stock disponible
        .map(inv => {
          const availableQty = Math.max(0, inv.stock - inv.reserved_quantity);
          return {
            id: inv.id,
            id_cup: inv.id_cup,
            available_quantity: availableQty,
            created_at: inv.created_at,
            updated_at: inv.updated_at,
            cup: inv.cup
          };
        });
      
      res.json(inventariosProcesados);
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: err.message });
    }
  },
  async findById(req, res) {
    try {
      const inventario = await InventoryCups.findByPk(req.params.id, {
        include: [
          { 
            model: Cup, 
            as: 'cup',
            where: { activo: true },
            required: true
          }
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
      const inventario = await InventoryCups.findByPk(req.params.id);
      if (!inventario) return res.status(404).json({ error: 'No encontrado' });
      await inventario.update(req.body);
      res.json(inventario);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const inventario = await InventoryCups.findByPk(req.params.id);
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
      const inventario = await InventoryCups.findByPk(req.params.id);
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
      const inventario = await InventoryCups.findByPk(req.params.id);
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