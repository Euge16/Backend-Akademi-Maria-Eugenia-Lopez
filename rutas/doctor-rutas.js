const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const doctorControlador = require('../controladores/doctor-controlador');

const autenticacion = require('../interceptor/autenticacion');
const verificarRol = require('../interceptor/verificar-rol');

router.use(autenticacion);

router.get('/', verificarRol(['admin', 'recepcion']), doctorControlador.getDoctoresActivos);
router.get('/:id', verificarRol(['admin', 'recepcion']), doctorControlador.getDoctorPorId);

router.post(
    '/',
    [
        check('nombre')
            .not()
            .isEmpty(),
        check('dni')
            .not()
            .isEmpty(),
        check('especialidad')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail({ gmail_remove_dots: false }) 
            .isEmail()
    ],
    verificarRol(['admin', 'recepcion']), 
    doctorControlador.crearDoctor
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
        check('especialidad')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail({ gmail_remove_dots: false }) 
            .isEmail(),
        check('activo')
            .optional()
            .isBoolean()
    ],
    verificarRol(['admin', 'recepcion']), 
    doctorControlador.actualizarDoctor
);

module.exports = router;



