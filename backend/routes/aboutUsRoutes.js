
const express = require('express');
const router = express.Router();
const aboutUsController = require('../controllers/aboutUsController');
const { authenticateAdmin } = require('../middleware/auth');

// Public route
router.get('/', aboutUsController.getAboutUs);

// Protected route (admin/staff only)
router.put('/', authenticateAdmin, aboutUsController.updateAboutUs);

module.exports = router;
