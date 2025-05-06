const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    try {
        const token = req.headers.authorization?.split(' ')[1]; // Formato: "Bearer TOKEN"
        if (!token) {
          return res.status(401).json({ mensaje: 'Fallo la autenticación: token no proporcionado.' });
        }
    
        const tokenDecodificado = jwt.verify(token, process.env.JWT_KEY);
        req.usuarioAutenticado = { 
            usuarioId: tokenDecodificado.usuarioId,
            rol: tokenDecodificado.rol || 'recepcion'
        }; 
        next();
    } catch (err) {
        return res.status(401).json({ mensaje: 'Fallo la autenticación: token inválido o expirado.' });
    }
};
