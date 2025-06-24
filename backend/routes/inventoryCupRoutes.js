const express = require('express');
const router = express.Router();
const inventoryCupController = require('../controllers/inventoryCupController');
const { authenticateAdmin } = require('../middleware/auth');

// router.post('/', authenticateAdmin, inventoryCupController.create);
router.get('/',authenticateAdmin, inventoryCupController.findAll);
router.get('/users', inventoryCupController.findAllForUsers);
router.get('/:id', authenticateAdmin, inventoryCupController.findById);
router.put('/:id', authenticateAdmin, inventoryCupController.update);
router.delete('/:id', authenticateAdmin, inventoryCupController.delete);

// Nuevas rutas para entrada y salida de stock
router.post('/:id/entrada', authenticateAdmin, inventoryCupController.entradaStock);
router.post('/:id/salida',authenticateAdmin, inventoryCupController.salidaStock);

module.exports = router; 