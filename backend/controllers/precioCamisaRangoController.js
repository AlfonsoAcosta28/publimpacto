const { PrecioCamisaRango } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const { id_camisa, min_cantidad, max_cantidad, precio_unitario } = req.body;

      // Verificar que el nuevo rango no se solape con rangos existentes
      const rangosExistentes = await PrecioCamisaRango.findAll({
        where: { id_camisa },
        order: [['min_cantidad', 'ASC']]
      });

      // Verificar que el nuevo rango no se solape con rangos existentes
      for (const rango of rangosExistentes) {
        // Verificar si hay solapamiento
        if ((min_cantidad >= rango.min_cantidad && min_cantidad <= rango.max_cantidad) ||
            (max_cantidad >= rango.min_cantidad && max_cantidad <= rango.max_cantidad) ||
            (min_cantidad <= rango.min_cantidad && max_cantidad >= rango.max_cantidad)) {
          return res.status(400).json({ 
            error: `El rango de cantidades (${min_cantidad}-${max_cantidad}) se solapa con un rango existente (${rango.min_cantidad}-${rango.max_cantidad}). Los rangos no pueden solaparse.` 
          });
        }
      }

      const rango = await PrecioCamisaRango.create(req.body);
      res.status(201).json(rango);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async findAll(req, res) {
    try {
      const rangos = await PrecioCamisaRango.findAll();
      res.json(rangos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async findById(req, res) {
    try {
      const rango = await PrecioCamisaRango.findByPk(req.params.id);
      if (!rango) return res.status(404).json({ error: 'No encontrado' });
      res.json(rango);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const rango = await PrecioCamisaRango.findByPk(req.params.id);
      if (!rango) return res.status(404).json({ error: 'No encontrado' });

      const { id_camisa, min_cantidad, max_cantidad, precio_unitario } = req.body;

      // Verificar que el rango actualizado no se solape con rangos existentes
      const rangosExistentes = await PrecioCamisaRango.findAll({
        where: { 
          id_camisa,
          id: { [require('sequelize').Op.ne]: req.params.id } // Excluir el rango actual
        },
        order: [['min_cantidad', 'ASC']]
      });

      // Verificar que el nuevo rango no se solape con rangos existentes
      for (const rangoExistente of rangosExistentes) {
        // Verificar si hay solapamiento
        if ((min_cantidad >= rangoExistente.min_cantidad && min_cantidad <= rangoExistente.max_cantidad) ||
            (max_cantidad >= rangoExistente.min_cantidad && max_cantidad <= rangoExistente.max_cantidad) ||
            (min_cantidad <= rangoExistente.min_cantidad && max_cantidad >= rangoExistente.max_cantidad)) {
          return res.status(400).json({ 
            error: `El rango de cantidades (${min_cantidad}-${max_cantidad}) se solapa con un rango existente (${rangoExistente.min_cantidad}-${rangoExistente.max_cantidad}). Los rangos no pueden solaparse.` 
          });
        }
      }

      await rango.update(req.body);
      res.json(rango);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const rango = await PrecioCamisaRango.findByPk(req.params.id);
      if (!rango) return res.status(404).json({ error: 'No encontrado' });
      await rango.destroy();
      res.json({ message: 'Eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}; 