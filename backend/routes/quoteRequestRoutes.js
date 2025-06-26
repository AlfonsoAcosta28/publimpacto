const express = require('express');
const router = express.Router();
const quoteRequestController = require('../controllers/quoteRequestController');
const { authenticateAdmin, authenticateJWT } = require('../middleware/auth');

router.get('/my', authenticateJWT, quoteRequestController.getUserQuotes);
router.get('/my/:id', authenticateJWT, quoteRequestController.getUserQuoteById);
router.post('/', authenticateJWT,  quoteRequestController.create);
router.get('/',authenticateAdmin, quoteRequestController.findAll);
router.get('/:id',authenticateAdmin, quoteRequestController.findById);
router.put('/:id', authenticateAdmin, quoteRequestController.update);
router.delete('/:id', authenticateAdmin, quoteRequestController.delete);
router.put('/:id/status', authenticateAdmin, quoteRequestController.updateStatus);

module.exports = router; 