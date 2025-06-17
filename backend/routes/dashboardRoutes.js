const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateJWT, authenticateAdmin } = require('../middleware/auth');


// Rutas del dashboard
router.get('/stats', authenticateAdmin, dashboardController.getStats);
router.get('/sales', authenticateAdmin, dashboardController.getSalesData);
router.get('/visits', authenticateAdmin, dashboardController.getVisitsData);
router.get('/categories', authenticateAdmin, dashboardController.getCategoryData);
router.get('/recent-orders', authenticateAdmin, dashboardController.getRecentOrders);
router.get('/recent-products', authenticateAdmin, dashboardController.getRecentProducts);
router.get('/recent-users', authenticateAdmin, dashboardController.getRecentUsers);

module.exports = router; 