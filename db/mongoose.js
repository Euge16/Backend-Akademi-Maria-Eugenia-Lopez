require('dotenv').config();
const mongoose = require('mongoose');


mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.fey7ork.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster1`)
    .then(() => console.log('Conexión exitosa!!'))
    .catch(err => console.error('Error: ', err.message));;

module.exports = mongoose;