const express = require('express');
const router = express.Router();
const tallaController = require('../controllers/tallaController');
const { authenticateAdmin } = require('../middleware/auth');

router.post('/', authenticateAdmin,  tallaController.create);
router.get('/', tallaController.findAll);
router.get('/:id', tallaController.findById);
router.put('/:id', authenticateAdmin, tallaController.update);
router.delete('/:id', authenticateAdmin, tallaController.delete);

module.exports = router; 