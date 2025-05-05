const express = require('express');
const mongoose = require('./db/mongoose');

const usuarioRoutes = require('./routes/usuario-routes');

const app = express();

app.use(express.json());
app.use('/api/usuarios', usuarioRoutes);

app.listen(5000);