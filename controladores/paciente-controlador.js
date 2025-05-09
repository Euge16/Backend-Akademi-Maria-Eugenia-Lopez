const Paciente = require('../modelos/paciente');

const getPacientes = async (req, res, next) => {
    const { pagina, limite, nombre, dni, cobertura } = req.query;
    const paginaInt = parseInt(pagina);
    const limiteInt = parseInt(limite);
    const filtro = {};

    if (nombre) filtro.nombre = new RegExp(nombre, 'i');
    if (dni) filtro.dni = dni;
    if (cobertura) filtro.coberturaMedica = new RegExp(cobertura, 'i');

    try {
        const pacientes = await Paciente.find(filtro)
            .skip((paginaInt - 1) * limiteInt)
            .limit(limiteInt);

        const total = await Paciente.countDocuments();
        res.json({ 
            paginaActual: paginaInt,
            totalPaginas: Math.ceil(total / limiteInt),
            totalRegistros: total,
            pacientes 
        });

    } catch (err) {
        res.status(500).json({ message: 'Error al obtener pacientes.' });
    }
};


const getPacientePorId = async (req, res, next) => {
    const { id } = req.params;

    try {
        const paciente = await Paciente.findById(id);
        if (!paciente) {
            return res.status(404).json({ message: 'Paciente no encontrado.' });
        }

        res.json({ paciente });
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el paciente.' });
    }
};


const crearPaciente = async (req, res, next) => {
    const { nombre, dni, coberturaMedica, email } = req.body;

    try {
        const existeDNI = await Paciente.findOne({ dni });
        if (existeDNI) {
            return res.status(400).json({ message: 'Ya existe un paciente con este DNI.' });
        }

        const nuevoPaciente = new Paciente({
            nombre,
            dni,
            coberturaMedica,
            email
        });

        await nuevoPaciente.save();

        res.status(201).json({
            message: 'Paciente creado correctamente.',
            paciente: nuevoPaciente
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al crear el paciente.' });
        
    }
};


const actualizarPaciente = async (req, res, next) => {
    const { id } = req.params;
    const { nombre, dni, coberturaMedica, email} = req.body;

    try {
        const paciente = await Paciente.findById(id);
        if (!paciente) {
            return res.status(404).json({ message: 'Paciente no encontrado.' });
        }

        paciente.nombre = nombre || paciente.nombre;
        paciente.dni = dni || paciente.dni;
        paciente.coberturaMedica = coberturaMedica || paciente.coberturaMedica;
        paciente.email = email || paciente.email;
       

        await paciente.save();

        res.json({
            message: 'Paciente actualizado correctamente.',
            paciente
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar el paciente.' });
    }
};


const eliminarPaciente = async (req, res, next) => {
    const { id } = req.params;

    try {
        const paciente = await Paciente.findById(id);
        if (!paciente) {
            return res.status(404).json({ message: 'Paciente no encontrado.' });
        }

        await paciente.deleteOne();

        res.json({ message: 'Paciente eliminado.' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el paciente.' });
    }
};




exports.getPacientes = getPacientes;
exports.getPacientePorId = getPacientePorId;
exports.crearPaciente = crearPaciente;
exports.actualizarPaciente = actualizarPaciente;
exports.eliminarPaciente = eliminarPaciente;