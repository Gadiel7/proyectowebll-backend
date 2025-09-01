const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Obtener el token de la cabecera (header) 'x-auth-token'
  const token = req.header('x-auth-token');

  // 2. Si no hay token en la petición, denegar el acceso
  if (!token) {
    return res.status(401).json({ message: 'No hay token, permiso denegado.' });
  }

  // 3. Si hay un token, intentar verificarlo
  try {
    // Verificar el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Si es válido, añadir la información del usuario del token a la petición (req.user)
    req.user = decoded.user;
    
    // Continuar al siguiente paso (la lógica de la ruta)
    next();
  } catch (err) {
    // Si el token no es válido (ha expirado, está malformado, etc.), denegar el acceso
    res.status(401).json({ message: 'El token no es válido.' });
  }
};