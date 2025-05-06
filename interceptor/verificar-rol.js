module.exports = (rolesPermitidos = ['admin']) => {
    return (req, res, next) => {
        const { rol } = req.usuarioAutenticado;

        if (!rolesPermitidos.includes(rol)) {
            return res.status(403).json({ mensaje: 'Acceso denegado: permisos insuficientes.' });
        }

        next();
    };
};