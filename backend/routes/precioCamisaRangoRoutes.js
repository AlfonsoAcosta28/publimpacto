const express = require('express');
const router = express.Router();
const precioCamisaRangoController = require('../controllers/precioCamisaRangoController');
const { authenticateAdmin } = require('../middleware/auth');

router.post('/', authenticateAdmin,  precioCamisaRangoController.create);
router.get('/', precioCamisaRangoController.findAll);
router.get('/:id', precioCamisaRangoController.findById);
router.put('/:id', authenticateAdmin, precioCamisaRangoController.update);
router.delete('/:id', authenticateAdmin, precioCamisaRangoController.delete);

module.exports = router; 