// controllers/authController.js (modificado)
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require('passport');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');

const generateToken = (user, type = 'user') => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      type: type,
      email: user.correo
    },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1d' }
  );
};

// Generar token de verificación
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

exports.register = async (req, res) => {
  try {
    const { nombre, correo, password, avatar } = req.body;
    if(password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres', type: 'password' });
    }
    if(password.length > 20) {
      return res.status(400).json({ message: 'La contraseña no puede tener más de 20 caracteres', type: 'password' });
    }
    if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/.test(password)) {
      return res.status(400).json({ 
        message: 'La contraseña debe contener letras, números y al menos un carácter especial', 
        type: 'password' 
      });
    }
    
    if(!/^[a-zA-Z\s]+$/.test(nombre)) {
      return res.status(400).json({ message: 'El nombre solo puede contener letras', type: 'nombre' });
    }
    if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correo)) {
      return res.status(400).json({ message: 'El correo no es válido', type: 'correo' });
    }

    const existingUser = await User.findOne({ where: { correo } });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado', type: 'correo' });
    }

    // Generar token de verificación
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24); // Token expira en 24 horas

    // Crear usuario con status UNAUTHORIZED por defecto
    const user = await User.create({
      nombre,
      correo,
      password,
      role: 'user',
      avatar,
      status: 'UNAUTHORIZED',
      verification_token: verificationToken,
      token_expires: tokenExpires
    });

    // Crear enlace de verificación
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
    
    // Enviar correo de verificación
    try {
      await sendVerificationEmail(user, verificationLink);
    } catch (emailError) {
      console.error('Error al enviar correo de verificación:', emailError);
      // No devolvemos error aquí, seguimos con el proceso
    }

    // No generamos token JWT porque el usuario debe verificar primero

    const { password: _, ...userData } = user.toJSON();

    res.status(201).json({
      message: 'Usuario registrado exitosamente. Por favor verifica tu correo electrónico para activar tu cuenta.',
      user: userData
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const { Op } = require('sequelize');

    console.log('--- VERIFICANDO CORREO ---');
    console.log('Token recibido en params:', token);
    console.log('Fecha actual del servidor:', new Date());


    const verifiedUser = await User.findOne({
      where: {
        verification_token: token,
        status: 'ACTIVE'
      }
    });

    if (verifiedUser) {
      console.log('Este correo ya fue verificado anteriormente.');
      return res.status(200).json({
        message: 'El correo ya fue verificado anteriormente. Puedes iniciar sesión.',
        alreadyVerified: true
      });
    }

    // Buscar usuario con el token y que no haya expirado
    const user = await User.findOne({ 
      where: { 
        verification_token: token,
        token_expires: { [Op.gt]: new Date() }
      } 
    });

    if (!user) {
      console.log('No se encontró usuario con ese token o el token ha expirado.');
      return res.status(400).json({ 
        message: 'El enlace de verificación es inválido o ha expirado' 
      });
    }

    console.log('Usuario encontrado:', {
      id: user.id,
      correo: user.correo,
      status: user.status,
      token_expires: user.token_expires,
    });

    // Actualizar estado del usuario
    user.status = 'ACTIVE';
    user.verification_token = null;
    user.token_expires = null;

    await user.save();

    console.log('Usuario actualizado y activado.');

    // Generar token de acceso
    const accessToken = generateToken(user);

    console.log('Token JWT generado exitosamente');

    return res.json({
      message: 'Correo verificado exitosamente. Ya puedes iniciar sesión.',
      token: accessToken
    });

  } catch (error) {
    console.error('Error al verificar correo:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
exports.resendVerification = async (req, res) => {
  try {
    const { correo } = req.body;
    
    const user = await User.findOne({ where: { correo } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (user.status === 'ACTIVE') {
      return res.status(400).json({ message: 'Esta cuenta ya está verificada' });
    }
    
    // Generar nuevo token de verificación
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24);
    
    user.verification_token = verificationToken;
    user.token_expires = tokenExpires;
    await user.save();
    
    // Crear enlace de verificación
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
    
    // Enviar correo de verificación
    await sendVerificationEmail(user, verificationLink);
    
    res.json({
      message: 'Se ha enviado un nuevo correo de verificación'
    });
  } catch (error) {
    console.error('Error al reenviar verificación:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const user = await User.findOne({ where: { correo } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar si el usuario tiene su correo verificado
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ 
        message: 'Cuenta no verificada. Por favor verifica tu correo electrónico.',
        needsVerification: true
      });
    }
    
    // Generar token específicamente de tipo 'user'
    const token = generateToken(user, 'user');
   
    const { password: _, ...userData } = user.toJSON();

    res.json({
      message: 'Inicio de sesión exitoso',
      user: userData,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const user = await User.findOne({ where: { correo } });
    if (!user) {
      return res.status(404).json({ message: 'Correo no encontrado' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado: solo administradores' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Verificar si el usuario tiene su correo verificado
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ 
        message: 'Cuenta no verificada. Por favor verifica tu correo electrónico.',
        needsVerification: true
      });
    }

    // Generar token específico para administrador
    const token = generateToken(user, 'admin');

    const { password: _, ...userData } = user.toJSON();

    res.json({
      message: 'Inicio de sesión exitoso como administrador',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Error en loginAdmin:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

exports.googleCallback = (req, res) => {
  // Esto debe ser actualizado para manejar la verificación
  // Para usuarios de Google, podríamos considerar los correos ya verificados
  const user = req.user;
  
  // Actualizar status a ACTIVE si es un usuario de Google
  if (user.google_id) {
    User.update({ status: 'ACTIVE' }, { where: { id: user.id } });
  }
  
  const token = generateToken(user);
  const { password: _, ...userData } = user.toJSON();

  // Redirect to frontend with token
  res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}`);
};

exports.me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado en la base de datos' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error en me:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  // console.log(req.body)
  try {
    const { 
      nombre, 
      telefono, 
      avatar,
    } = req.body;

    // Obtener el usuario de la base de datos usando el ID del token
    const userFromDB = await User.findByPk(req.user.id);
    
    if (!userFromDB) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar los datos básicos del usuario
    userFromDB.nombre = nombre || userFromDB.nombre;
    userFromDB.telefono = telefono || userFromDB.telefono;
    userFromDB.avatar = avatar || userFromDB.avatar;

    // Guardar los cambios en la base de datos
    await userFromDB.save();
    
    // Convertir a JSON y eliminar la contraseña
    const { password, ...userData } = userFromDB.toJSON();

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: userData
    });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500).json({ message: 'Error al actualizar el perfil', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });

    // Add base URL to avatar paths
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const usersWithAvatarUrls = users.map(user => {
      const userData = user.toJSON();
      if (userData.avatar) {
        userData.avatar = `${baseUrl}${userData.avatar}`;
      }
      return userData;
    });

    res.json(usersWithAvatarUrls);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
};