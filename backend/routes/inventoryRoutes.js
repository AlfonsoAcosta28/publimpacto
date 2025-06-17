const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateAdmin, authenticateJWT } = require('../middleware/auth');

// router.get('/', authenticateAdmin, inventoryController.getAllInventoryAdmin);
router.get('/', authenticateAdmin, inventoryController.getAllInventory);

router.get('/low-stock', inventoryController.getLowStockItems);
router.get('/:id', authenticateJWT, inventoryController.getInventoryById);
router.post('/', authenticateAdmin, inventoryController.createInventory);
router.put('/:id', authenticateAdmin, inventoryController.updateInventory);
router.delete('/:id', authenticateAdmin, inventoryController.deleteInventory);

// Rutas para movimientos de stock
router.patch('/:id/adjust', authenticateAdmin, inventoryController.adjustStock);
router.patch('/:id/reserve', authenticateJWT, inventoryController.reserveStock);
router.patch('/:id/release', authenticateJWT, inventoryController.releaseStock);
router.patch('/:id/status', authenticateAdmin, inventoryController.changeInventoryStatus);

module.exports = router;