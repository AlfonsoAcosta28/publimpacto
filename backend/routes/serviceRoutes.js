const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const serviceController = require('../controllers/serviceController');
const { authenticateAdmin } = require('../middleware/auth');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/services')
  },
  filename: function (req, file, cb) {
    // Asegurar que la ruta se guarde con forward slashes
    const filename = Date.now() + '-' + file.originalname;
    cb(null, filename)
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Aceptar imágenes y documentos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// Configuración específica para servicios con múltiples campos de archivos
const serviceUpload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Aceptar solo imágenes para servicios
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
}).fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'secondaryImages', maxCount: 4 }
]);

// Rutas públicas (catálogo)
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Rutas protegidas (solo admin)
router.post('/', authenticateAdmin, serviceUpload, serviceController.createService);
router.put('/:id', authenticateAdmin, serviceUpload, serviceController.updateService);
router.delete('/:id', authenticateAdmin, serviceController.deleteService);
router.put('/:id/toggle-status', authenticateAdmin, serviceController.toggleServiceStatus);

module.exports = router;
