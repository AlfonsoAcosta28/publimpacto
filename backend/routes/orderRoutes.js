
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateJWT,authenticateAdmin } = require('../middleware/auth');

// User routes
router.get('/user', authenticateJWT, orderController.getUserOrders);
router.post('/', authenticateJWT, orderController.createOrder);
router.put('/:id/cancel', authenticateJWT, orderController.cancelOrder);
router.get('/:id', authenticateJWT, orderController.getOrderById);

// Admin/Staff routes
router.get('/', authenticateAdmin, orderController.getAllOrders);
router.put('/:id/status', authenticateAdmin, orderController.updateOrderStatus);
router.get('/users/:userId/orders', authenticateAdmin, orderController.getUserOrders);
module.exports = router;