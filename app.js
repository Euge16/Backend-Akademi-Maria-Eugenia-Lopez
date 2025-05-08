const express = require('express');
const mongoose = require('./db/mongoose');

const usuarioRoutes = require('./rutas/usuario-rutas');
const pacienteRoutes = require('./rutas/paciente-rutas');
const doctorRoutes = require('./rutas/doctor-rutas');
const turnoRoutes = require('./rutas/turno-rutas');

const app = express();

app.use(express.json());
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/doctores', doctorRoutes);
app.use('/api/turnos', turnoRoutes);

app.listen(5000);