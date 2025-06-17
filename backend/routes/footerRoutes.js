
const express = require('express');
const router = express.Router();
const footerController = require('../controllers/footerController');
const { authenticateAdmin } = require('../middleware/auth');

// Public route
router.get('/', footerController.getFooter);

// Protected route (admin/staff only)
router.put('/', authenticateAdmin, footerController.updateFooter);

module.exports = router;