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
router.get('/paginated', productController.getPaginatedProducts);
router.get('/related/:productId/:categoryId', productController.getRelatedProducts);
router.get('/:id', productController.getProductById);
router.get('/category/:categoryId', productController.getProductsByCategory);

// Admin Routes
router.get('/', authenticateAdmin, productController.getAllProducts);
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

// Ruta para aplicar descuentos
router.post('/:id/discount', authenticateAdmin, productController.applyDiscount);

// Ruta para eliminar descuento
router.post('/:id/discount/remove', authenticateAdmin, productController.removeDiscount);

module.exports = router;