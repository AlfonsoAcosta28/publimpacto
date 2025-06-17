const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Verificar que sea un token de tipo user o admin
    if (decoded.type !== 'user' && decoded.type !== 'admin') {
      return res.status(403).json({ message: 'Tipo de token no válido' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Verificar que sea un token de tipo admin
    if (decoded.type !== 'admin') {
      console.log('Token type:', decoded.type); // Para debugging
      return res.status(403).json({ message: 'Acceso denegado: requiere token de administrador' });
    }

    // Verificar que el usuario tenga rol de administrador
    if (decoded.role !== 'admin') {
      console.log('User role:', decoded.role); // Para debugging
      return res.status(403).json({ message: 'Acceso denegado: requiere rol de administrador' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error al verificar el token de administrador:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = { authenticateJWT, authenticateAdmin };