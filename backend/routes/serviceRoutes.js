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
    cb(null, Date.now() + '-' + file.originalname)
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

// Rutas públicas
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);


router.post('/', authenticateAdmin,serviceController.createService);
router.put('/:id',authenticateAdmin, serviceController.updateService);
router.delete('/:id',authenticateAdmin, serviceController.deleteService);

// Rutas para documentos
router.post('/:id/documents', upload.single('document'), serviceController.uploadServiceDocument);
router.delete('/:id/documents/:documentId', serviceController.deleteServiceDocument);

module.exports = router;
