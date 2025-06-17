const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productCustomizationController = require('../controllers/productCustomizationController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/customizations')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Solo aceptar imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});


// Rutas para personalizaciones
router.get('/', productCustomizationController.getAllCustomizations);
router.get('/product/:productId', productCustomizationController.getCustomizationsByProduct);
router.get('/user/:userId', productCustomizationController.getCustomizationsByUser);
router.post('/product/:productId', upload.single('image'), productCustomizationController.createCustomization);
router.put('/:id/status', productCustomizationController.updateCustomizationStatus);
router.delete('/:id', productCustomizationController.deleteCustomization);

module.exports = router; 