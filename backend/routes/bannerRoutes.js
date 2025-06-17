const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', bannerController.getAllBanners);
router.get('/:id', bannerController.getBannerById);

// Protected routes (admin/staff only)
router.post('/', 
  authenticateAdmin, 
  upload.single('imagen'), 
  bannerController.createBanner
);

router.put('/:id', 
  authenticateAdmin, 
  upload.single('imagen'), 
  bannerController.updateBanner
);

router.delete('/:id', 
  authenticateAdmin, 
  bannerController.deleteBanner
);

module.exports = router;
