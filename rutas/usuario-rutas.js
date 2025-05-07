const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const usuarioControlador = require('../controladores/usuario-controlador');
const autenticacion = require('../interceptor/autenticacion');
const verificarRol = require('../interceptor/verificar-rol');


router.post(
    '/signup',
    [
        check('nombre')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail({ gmail_remove_dots: false }) // Test@test.com => test@test.com
            .isEmail(),
        check('password').isLength({ min: 6 }),
        check('rol').optional().isIn(['admin', 'recepcion'])
    ],
    usuarioControlador.signup
);

router.post('/login', usuarioControlador.login);


router.post('/recuperar-password', usuarioControlador.solicitarRecuperacionPassword);
router.post('/restablecer-password/:token', usuarioControlador.restablecerPassword);

router.use(autenticacion);

router.get('/', verificarRol(['admin']), usuarioControlador.getUsuarios);

router.delete('/:id', verificarRol(['admin']), usuarioControlador.eliminarUsuario);

router.patch(
    '/:id',
    verificarRol(['admin']),
    [
        check('nombre')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail({ gmail_remove_dots: false }) // Test@test.com => test@test.com
            .isEmail()
    ],
    usuarioControlador.editarUsuario
);

module.exports = router;
