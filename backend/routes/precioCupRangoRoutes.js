const express = require('express');
const router = express.Router();
const precioCupRangoController = require('../controllers/precioCupRangoController');
const { authenticateAdmin } = require('../middleware/auth');

router.post('/', authenticateAdmin,  precioCupRangoController.create);
router.get('/', precioCupRangoController.findAll);
router.get('/:id', precioCupRangoController.findById);
router.put('/:id', authenticateAdmin, precioCupRangoController.update);
router.delete('/:id', authenticateAdmin, precioCupRangoController.delete);

module.exports = router; 