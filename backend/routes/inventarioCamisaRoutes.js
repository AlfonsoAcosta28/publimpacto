const express = require('express');
const router = express.Router();
const inventarioCamisaController = require('../controllers/inventarioCamisaController');
const { authenticateAdmin } = require('../middleware/auth');

router.post('/', authenticateAdmin, inventarioCamisaController.create);
router.get('/',authenticateAdmin, inventarioCamisaController.findAll);
router.get('/:id', authenticateAdmin, inventarioCamisaController.findById);
router.put('/:id', authenticateAdmin, inventarioCamisaController.update);
router.delete('/:id', authenticateAdmin, inventarioCamisaController.delete);

// Nuevas rutas para entrada y salida de stock
router.post('/:id/entrada', authenticateAdmin, inventarioCamisaController.entradaStock);
router.post('/:id/salida',authenticateAdmin, inventarioCamisaController.salidaStock);

module.exports = router; 