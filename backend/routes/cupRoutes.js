const express = require('express');
const router = express.Router();
const cupController = require('../controllers/cupController');
const { authenticateAdmin } = require('../middleware/auth');

router.post('/', authenticateAdmin, cupController.create);
router.get('/', cupController.findAll);
// router.get('/:id', cupController.findById);
router.put('/:id', authenticateAdmin, cupController.update);
router.delete('/:id', authenticateAdmin, cupController.delete);

module.exports = router; 