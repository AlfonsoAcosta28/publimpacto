const express = require('express');
const router = express.Router();
const camisaController = require('../controllers/camisaController');
const { authenticateAdmin } = require('../middleware/auth');

router.post('/', authenticateAdmin, camisaController.create);
router.get('/', camisaController.findAll);
router.get('/:id', camisaController.findById);
router.put('/:id', authenticateAdmin, camisaController.update);
router.delete('/:id', authenticateAdmin, camisaController.delete);

module.exports = router; 