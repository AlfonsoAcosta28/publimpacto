const express = require('express');
const router = express.Router();
const finalQuoteController = require('../controllers/finalQuoteController');
const { authenticateAdmin, authenticateJWT } = require('../middleware/auth');

// router.get('/my', authenticateJWT, finalQuoteController.getUserFinalQuotes);
router.post('/', authenticateAdmin,  finalQuoteController.create);
router.get('/', authenticateAdmin, finalQuoteController.findAll);
router.get('/:id',authenticateAdmin, finalQuoteController.findById);
router.put('/:id', authenticateAdmin, finalQuoteController.update);
router.delete('/:id', authenticateAdmin, finalQuoteController.delete);

module.exports = router; 