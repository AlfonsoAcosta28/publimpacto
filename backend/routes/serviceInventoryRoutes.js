const express = require('express');
const router = express.Router();
const serviceInventoryController = require('../controllers/serviceInventoryController');
const { authenticateAdmin } = require('../middleware/auth');

// Rutas para inventario de servicios
router.get('/service/:serviceId', serviceInventoryController.getServiceInventory);
router.post('/service/:serviceId', authenticateAdmin, serviceInventoryController.addInventoryItem);
router.put('/item/:itemId', authenticateAdmin, serviceInventoryController.updateInventoryItem);
router.delete('/item/:itemId', authenticateAdmin, serviceInventoryController.deleteInventoryItem);
router.get('/all', serviceInventoryController.getAllInventories);

module.exports = router; 