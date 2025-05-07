const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const pacienteSchema = new Schema({
  nombre: { type: String, required: true },
  dni: { type: String, required: true, unique: true },
  coberturaMedica: { type: String, required: true },
  email: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Paciente', pacienteSchema);