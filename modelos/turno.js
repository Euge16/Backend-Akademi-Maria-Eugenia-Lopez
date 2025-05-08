const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const turnoSchema = new Schema({
    pacienteId: { type: mongoose.Types.ObjectId, required: true, ref: 'Paciente'},
    doctorId: { type: mongoose.Types.ObjectId, required: true, ref: 'Doctor'},
    fechaHora: { type: Date, required: true },
    estado: { type: String, enum: ['confirmado', 'cancelado'], default: 'confirmado'}
}, { timestamps: true });

module.exports = mongoose.model('Turno', turnoSchema);