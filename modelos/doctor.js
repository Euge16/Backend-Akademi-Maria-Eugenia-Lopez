const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const doctorSchema = new Schema({
  nombre: { type: String, required: true },
  dni: { type: String, required: true, unique: true },
  especialidad: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  activo: { type: Boolean, default: true}
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);