const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
});

module.exports = mongoose.model('Usuario', usuarioSchema);