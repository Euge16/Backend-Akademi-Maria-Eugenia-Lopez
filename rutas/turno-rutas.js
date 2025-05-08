const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const turnoControlador = require('../controladores/turno-controlador');

const autenticacion = require('../interceptor/autenticacion');
const verificarRol = require('../interceptor/verificar-rol');

router.use(autenticacion);

router.get('/', verificarRol(['admin', 'recepcion']), turnoControlador.getTurnos);
router.get('/:id', verificarRol(['admin', 'recepcion']), turnoControlador.getTurnoPorId);


router.post(
    '/',
    [
        check('pacienteId')
            .not()
            .isEmpty(),
        check('doctorId')
            .not()
            .isEmpty(),
        check('fechaHora')
            .not()
            .isEmpty()
            .isISO8601()
    ],
    verificarRol(['admin', 'recepcion']),
    turnoControlador.crearTurno
);


router.patch(
    '/:id',
    [
        check('estado')
            .isIn(['confirmado', 'cancelado'])
    ],
    verificarRol(['admin', 'recepcion']),
    turnoControlador.actualizarEstadoTurno
);

module.exports = router;