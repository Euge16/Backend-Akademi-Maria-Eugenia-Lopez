const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const pacienteControlador = require('../controladores/paciente-controlador');

const autenticacion = require('../interceptor/autenticacion');
const verificarRol = require('../interceptor/verificar-rol');

router.use(autenticacion);

router.get('/', verificarRol(['admin', 'recepcion']), pacienteControlador.getPacientes);
router.get('/:id', verificarRol(['admin', 'recepcion']), pacienteControlador.getPacienteById);

router.post(
    '/',
    [
        check('nombre')
            .not()
            .isEmpty(),
        check('dni')
            .not()
            .isEmpty(),
        check('coberturaMedica')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail({ gmail_remove_dots: false }) // Test@test.com => test@test.com
            .isEmail(),
    ],
    verificarRol(['admin', 'recepcion']), 
    pacienteControlador.crearPaciente
);
router.patch(
    '/:id',
    [
        check('nombre')
            .not()
            .isEmpty(),
        check('dni')
            .not()
            .isEmpty(),
        check('coberturaMedica')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail({ gmail_remove_dots: false }) // Test@test.com => test@test.com
            .isEmail(),
    ],
    verificarRol(['admin', 'recepcion']), 
    pacienteControlador.actualizarPaciente
);
router.delete('/:id', verificarRol(['admin', 'recepcion']), pacienteControlador.eliminarPaciente);

module.exports = router;