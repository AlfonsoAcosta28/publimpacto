const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT, authenticateAdmin } = require('../middleware/auth');
const { checkAdminOrigin } = require('../middleware/checkOrigin');
const upload = require('../middleware/upload');

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/loginAdmin', checkAdminOrigin, authController.loginAdmin);

router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Rutas protegidas para usuarios normales
router.get('/me', authenticateJWT, authController.me);
router.put('/profile', authenticateJWT, upload.single('avatar'), authController.updateProfile);

// Rutas protegidas para administradores
router.get('/users', authenticateAdmin, authController.getAllUsers);

module.exports = router;
