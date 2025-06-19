const express = require('express');
const router = express.Router();
const ordenCamisaController = require('../controllers/ordenCamisaController');
const { authenticateAdmin,  authenticateJWT} = require('../middleware/auth');

router.post('/', authenticateJWT, ordenCamisaController.create);
router.get('/', authenticateAdmin, ordenCamisaController.findAll);
router.get('/:id', authenticateJWT, ordenCamisaController.findById);
router.put('/:id', authenticateJWT, ordenCamisaController.update);
router.delete('/:id',authenticateAdmin, ordenCamisaController.delete);

module.exports = router; 