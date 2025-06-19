const express = require('express');
const router = express.Router();
const ordenItemCamisaController = require('../controllers/ordenItemCamisaController');
const { authenticateAdmin, authenticateJWT } = require('../middleware/auth');

router.post('/', authenticateJWT, ordenItemCamisaController.create);
router.get('/', authenticateAdmin, ordenItemCamisaController.findAll);
router.get('/:id', authenticateAdmin, ordenItemCamisaController.findById);
router.put('/:id', authenticateAdmin, ordenItemCamisaController.update);
router.delete('/:id', authenticateAdmin, ordenItemCamisaController.delete);

module.exports = router; 