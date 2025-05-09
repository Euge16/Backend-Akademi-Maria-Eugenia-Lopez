const Turno = require('../modelos/turno');
const Paciente = require('../modelos/paciente');
const Doctor = require('../modelos/doctor');


const getTurnos = async (req, res, next) => {
    const { pagina, limite, pacienteId, doctorId } = req.query;
    const paginaInt = parseInt(pagina);
    const limiteInt = parseInt(limite);

    const filtro = {};
    if (pacienteId) filtro.pacienteId = pacienteId;
    if (doctorId) filtro.doctorId = doctorId;

    try {
        const turnos = await Turno.find(filtro)
            .populate('pacienteId', 'nombre dni')
            .populate('doctorId', 'nombre especialidad activo')
            .skip((paginaInt - 1) * limiteInt)
            .limit(limiteInt);

        const total = await Turno.countDocuments();
        res.json({
            paginaActual: paginaInt,
            totalPaginas: Math.ceil(total / limiteInt),
            totalRegistros: total,
            turnos 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener los turnos.' });
    }
};


const getTurnoPorId = async (req, res, next) => {
    const { id } = req.params;

    try {
        const turno = await Turno.findById(id)
            .populate('pacienteId', 'nombre dni')
            .populate('doctorId', 'nombre especialidad activo');

        if (!turno) {
            return res.status(404).json({ message: 'Turno no encontrado.' });
        }

        res.json({ turno });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener el turno.' });
    }
};


const crearTurno = async (req, res, next) => {
    const { pacienteId, doctorId, fechaHora } = req.body;

    try {
        const [paciente, doctor] = await Promise.all([
            Paciente.findById(pacienteId),
            Doctor.findById(doctorId)
        ]);

        if (!paciente || !doctor) {
            return res.status(404).json({ message: 'Paciente o doctor no encontrado.' });
        }

        const turnoExistente = await Turno.findOne({
            doctorId,
            fechaHora,
            estado: 'confirmado'
        });

        if (turnoExistente) {
            return res.status(400).json({
                message: 'El doctor ya tiene un turno agendado en esta fecha y hora.'
            });
        }

        const nuevoTurno = new Turno({
            pacienteId,
            doctorId,
            fechaHora,
            estado: 'confirmado'
        });

        await nuevoTurno.save();

        res.status(201).json({
            message: 'Turno creado correctamente.',
            turno: nuevoTurno
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al crear el turno.' });
    }
};


const actualizarEstadoTurno = async (req, res, next) => {
    const { id } = req.params;

    try {
        const turno = await Turno.findById(id);

        if (!turno) {
            return res.status(404).json({ message: 'Turno no encontrado.' });
        }

        if (turno.estado === 'cancelado') {
            return res.status(400).json({ message: 'Este turno ya esta cancelado.' });
        }

        turno.estado = "cancelado";
        await turno.save();

        res.json({
            message: 'Turno actualizado correctamente.',
            turno
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al actualizar el estado del turno.' });
    }
};

exports.getTurnos = getTurnos;
exports.getTurnoPorId = getTurnoPorId;
exports.crearTurno = crearTurno;
exports.actualizarEstadoTurno = actualizarEstadoTurno;