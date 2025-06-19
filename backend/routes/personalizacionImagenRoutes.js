const express = require('express');
const router = express.Router();
const personalizacionImagenController = require('../controllers/personalizacionImagenController');
const { authenticateAdmin } = require('../middleware/auth');

router.post('/', authenticateAdmin, personalizacionImagenController.create);
router.get('/', personalizacionImagenController.findAll);
router.get('/:id', personalizacionImagenController.findById);
router.put('/:id', authenticateAdmin, personalizacionImagenController.update);
router.delete('/:id', authenticateAdmin, personalizacionImagenController.delete);

module.exports = router; 