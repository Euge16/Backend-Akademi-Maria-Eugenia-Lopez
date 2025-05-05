const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');


const getUsuarios = async (req, res, next) => {
  try {
    const usuarios = await Usuario.find({}, '-password');
    res.json({ usuarios: usuarios.map(u => u.toObject({ getters: true, versionKey: false })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los usuarios. Intente más tarde.' });
  }
};


const signup = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(422).json({ message: 'Datos inválidos. Verifique e intente nuevamente.' });
  }

  const { nombre, email, password } = req.body;

  let usuarioExistente;
  try {
    usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(422).json({ message: 'El usuario ya existe. Por favor inicie sesión.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashedPassword
    });

    await nuevoUsuario.save();

    const token = jwt.sign(
      { usuarioId: nuevoUsuario.id, email: nuevoUsuario.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      usuarioId: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      token: token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar el usuario. Intente más tarde.' });
  }
};


const login = async (req, res, next) => {
  const { email, password } = req.body;

  let usuario;
  try {
    usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { usuarioId: usuario.id, email: usuario.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      usuarioId: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al iniciar sesión. Intente más tarde.' });
  }
};

exports.getUsuarios = getUsuarios;
exports.signup = signup;
exports.login = login;
