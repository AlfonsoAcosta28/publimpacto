const express = require('express');
const router = express.Router();
const serviceOrderController = require('../controllers/serviceOrderController');
const { authenticateAdmin, authenticateJWT } = require('../middleware/auth');

// Rutas públicas (para clientes)
router.post('/quote', serviceOrderController.createServiceQuote);
router.get('/my-quotes', authenticateJWT, serviceOrderController.getQuotesByUserId);
router.get('/quote/:id', serviceOrderController.getServiceQuoteById);

// Rutas protegidas (para admin)
router.get('/', authenticateAdmin, serviceOrderController.getAllServiceQuotes);
router.put('/:id/status', authenticateAdmin, serviceOrderController.updateServiceQuoteStatus);
router.get('/by-email/:email', authenticateAdmin, serviceOrderController.getQuotesByEmail);

module.exports = router; 