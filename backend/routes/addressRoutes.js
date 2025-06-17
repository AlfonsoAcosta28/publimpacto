// routes/addressRoutes.js
const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

const { authenticateJWT } = require('../middleware/auth');

// Rutas para direcciones
router.post('/:id/set-default', authenticateJWT, addressController.setDefaultAddress);
router.get('/:id', authenticateJWT, addressController.getAddressById);
router.post('/', authenticateJWT,  addressController.createAddress);
router.put('/:id', authenticateJWT, addressController.updateAddress);
router.delete('/:id', authenticateJWT, addressController.deleteAddress);
router.get('/', authenticateJWT, addressController.getAllAddresses);

module.exports = router;