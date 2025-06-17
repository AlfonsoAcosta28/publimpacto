const express = require('express');
const router = express.Router();
const shippingPriceController = require('../controllers/shippingPriceController');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/current', shippingPriceController.getCurrentShippingPrice);

// router.get('/', authenticateAdmin, shippingPriceController.getAllShippingPrices);
router.post('/', authenticateAdmin, shippingPriceController.createShippingPrice);
// router.put('/:id', authenticateAdmin, shippingPriceController.updateShippingPrice);
// router.delete('/:id', authenticateAdmin, shippingPriceController.deleteShippingPrice);

module.exports = router;