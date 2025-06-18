const express = require('express');
const router = express.Router();
const serviceOrderController = require('../controllers/serviceOrderController');
const { authenticateAdmin } = require('../middleware/auth');

// Rutas públicas (para clientes)
router.post('/create', serviceOrderController.createServiceOrder);
router.get('/by-email/:email', serviceOrderController.getOrdersByEmail);
router.get('/:id', serviceOrderController.getServiceOrderById);

// Rutas protegidas (para admin)
router.get('/', authenticateAdmin, serviceOrderController.getAllServiceOrders);
router.put('/:id/status', authenticateAdmin, serviceOrderController.updateServiceOrderStatus);

module.exports = router; 