const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const uploadFields = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'secondaryImages', maxCount: 4 }
]);

// Public routes
router.get('/recent', productController.getRecentProducts);
router.get('/filter', productController.getFilteredProducts);
router.get('/related/:productId/:categoryId', productController.getRelatedProducts);
router.get('/:id', productController.getProductById);
router.get('/category/:categoryId', productController.getProductsByCategory);

router.get('/', authenticateAdmin, productController.getAllProducts);
// router.get('/admin', authenticateAdmin, productController.getAllProductsAdmin);
// Protected routes (admin/staff only)
router.post('/', 
  authenticateAdmin, 
  uploadFields, 
  productController.createProduct
);

router.put('/:id', 
  authenticateAdmin, 
  upload.single('image'), 
  productController.updateProduct
);

router.delete('/:id', authenticateAdmin, productController.deleteProduct);

module.exports = router;