const Doctor = require('../modelos/doctor');

const getDoctoresActivos = async (req, res, next) => {
    const { pagina, limite, especialidad } = req.query;
    const paginaInt = parseInt(pagina);
    const limiteInt = parseInt(limite);
    const filtro = { 
        especialidad: new RegExp(especialidad, 'i'),
        activo: true 
    };

    try {
        const doctores = await Doctor.find(filtro)
            .skip((paginaInt - 1) * limiteInt)
            .limit(limiteInt);

        const total = await Doctor.countDocuments();

        res.json({
            paginaActual: paginaInt,
            totalPaginas: Math.ceil(total / limiteInt),
            totalRegistros: total,
            doctores 
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener doctores.' });
    }
};

const getDoctorPorId = async (req, res, next) => {
    const { id } = req.params;

    try {
        const doctor = await Doctor.findById(id);
        if (!doctor || !doctor.activo) {
            return res.status(404).json({ message: 'Doctor no encontrado.' });
        }

        res.json({ doctor });
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el doctor.' });
    }
};


const crearDoctor = async (req, res, next) => {
    const { nombre, dni, especialidad, email } = req.body;

    try {
        const doctorExistente = await Doctor.findOne({ email, activo: true });
        if (doctorExistente) {
            return res.status(400).json({ message: 'Ya existe un doctor con ese email.' });
        }

        const nuevoDoctor = new Doctor({
            nombre,
            dni,
            especialidad,
            email
        });

        await nuevoDoctor.save();

        res.status(201).json({
            message: 'Doctor creado correctamente.',
            doctor: nuevoDoctor
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al crear el doctor.' });
    }
};


const actualizarDoctor = async (req, res, next) => {
    const { id } = req.params;
    const { nombre, dni, especialidad, email } = req.body;

    try {
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor no encontrado.' });
        }

        doctor.nombre = nombre || doctor.nombre;
        doctor.dni = dni || doctor.dni;
        doctor.especialidad = especialidad || doctor.especialidad;
        doctor.email = email || doctor.email;
        
        await doctor.save();

        res.json({
            message: 'Doctor actualizado correctamente.',
            doctor
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar el doctor.' });
    }
};

const inhabilitarDoctor = async (req, res, next) => {
    const { id } = req.params;
    try {
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor no encontrado.' });
        }

        doctor.activo = false;
        await doctor.save();

        res.json({
            message: 'Doctor inhabilitado correctamente.',
            doctor
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al inhabilirar el doctor.' });
    }
}

const habilitarDoctor = async (req, res, next) => {
    const { id } = req.params;
    try {
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor no encontrado.' });
        }

        doctor.activo = true;
        await doctor.save();

        res.json({
            message: 'Doctor habilitado correctamente.',
            doctor
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al inhabilirar el doctor.' });
    }
}

exports.getDoctoresActivos = getDoctoresActivos;
exports.getDoctorPorId = getDoctorPorId;
exports.crearDoctor = crearDoctor;
exports.actualizarDoctor = actualizarDoctor;
exports.inhabilitarDoctor = inhabilitarDoctor;
exports.habilitarDoctor = habilitarDoctor;
