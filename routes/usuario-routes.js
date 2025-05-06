const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const usuarioController = require('../controllers/usuario-controller');
const checkAuth = require('../middleware/auth');
const checkRol = require('../middleware/checkRol');


router.post(
    '/signup',
    [
        check('nombre')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail() // Test@test.com => test@test.com
            .isEmail(),
        check('password').isLength({ min: 6 }),
        check('rol').optional().isIn(['admin', 'recepcion'])
    ],
    usuarioController.signup
);

router.post('/login', usuarioController.login);

router.use(checkAuth);

router.get('/', checkRol(['admin']), usuarioController.getUsuarios);

router.delete('/:id', checkRol(['admin']), usuarioController.eliminarUsuario);

router.patch(
    '/:id',
    checkRol(['admin']),
    [
        check('nombre')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail() // Test@test.com => test@test.com
            .isEmail()
    ],
    usuarioController.editarUsuario
);

module.exports = router;
