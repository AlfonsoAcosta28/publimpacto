const express = require('express');
const router = express.Router();
const colorController = require('../controllers/colorController');
const { authenticateAdmin } = require('../middleware/auth');

router.post('/', authenticateAdmin,  colorController.create);
router.get('/', colorController.findAll);
router.get('/:id', colorController.findById);
router.put('/:id', authenticateAdmin, colorController.update);
router.delete('/:id', authenticateAdmin, colorController.delete);

module.exports = router; 