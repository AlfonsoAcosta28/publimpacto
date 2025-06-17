
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/recent', categoryController.getRecentCategories )
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/products', categoryController.getCategoryWithProducts);

// Protected routes (admin/staff only)
router.post('/', 
  authenticateAdmin, 
  upload.single('image'), 
  categoryController.createCategory
);

router.put('/:id', 
  authenticateAdmin,
  upload.single('image'), 
  categoryController.updateCategory
);

router.delete('/:id', authenticateAdmin, categoryController.deleteCategory);

module.exports = router;