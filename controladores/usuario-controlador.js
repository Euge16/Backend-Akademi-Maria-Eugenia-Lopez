const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../modelos/usuario');
const nodemailer = require("nodemailer");



const getUsuarios = async (req, res, next) => {
  const { pagina , limite } = req.query;
  const paginaInt = parseInt(pagina);
  const limiteInt = parseInt(limite);
  try {
    const usuarios = await Usuario.find({}, '-password')
      .skip((paginaInt - 1) * limiteInt)
      .limit(limiteInt);

    const total = await Usuario.countDocuments();
    res.json({
      paginaActual: paginaInt,
      totalPaginas: Math.ceil(total / limiteInt),
      totalRegistros: total,
      usuarios: usuarios.map(u => u.toObject({ getters: true, versionKey: false })) 
    });
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

  const { nombre, email, password, rol } = req.body;

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
      password: hashedPassword,
      rol: rol || 'recepcion'
    });

    await nuevoUsuario.save();

    res.status(201).json({
      usuarioId: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol
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
      { usuarioId: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_KEY,
      { expiresIn: '30d' }
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

const eliminarUsuario = async (req, res, next) => {
  const usuarioId = req.params.id;

  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await usuario.deleteOne();
    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar el usuario.' });
  }
};

const editarUsuario = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).json({ message: 'Datos inválidos, por favor revisa los campos.' });
  }

  const usuarioId = req.params.id;
  const { nombre, email, rol } = req.body;


  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (rol && req.usuarioAutenticado.rol !== 'admin') {
      return res.status(403).json({ message: 'No puedes modificar el rol.' });
    }

    if (req.usuarioAutenticado.rol !== 'admin' && usuarioId !== req.usuarioAutenticado.usuarioId) {
      return res.status(403).json({ message: 'No tienes permiso para editar este usuario.' });
    }

    usuario.nombre = nombre || usuario.nombre;
    usuario.email = email || usuario.email;
    if (rol) {
      usuario.rol = rol;
    }

    await usuario.save();

    res.json({
      message: 'Usuario actualizado correctamente.',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el usuario.' });
  }
};

const solicitarRecuperacionPassword= async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_KEY, { expiresIn: '1h' });


    usuario.tokenRecuperacion = token;
    usuario.expiracionTokenRecuperacion = Date.now() + 3600000; // 1 hora
    await usuario.save();

    
    const transporte = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USUARIO,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const emailOpciones = {
      from: process.env.EMAIL_USUARIO,
      to: email,
      subject: 'Recuperación de contraseña',
      text: `Haz clic en este enlace para restablecer tu contraseña: http://localhost:5000/api/usuarios/restablecer-password/${token}`
    };

    await transporte.sendMail(emailOpciones);

    res.json({ mensaje: 'Correo enviado con instrucciones.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al procesar la solicitud.' });
  }
};

const restablecerPassword = async (req, res) => {
  const { token } = req.params;
  const { nuevaPassword } = req.body;

  try {
    const usuario = await Usuario.findOne({
      tokenRecuperacion: token,
      expiracionTokenRecuperacion: { $gt: Date.now() } // Token todavia valido
    });

    if (!usuario) {
      return res.status(400).json({ mensaje: 'Token inválido o expirado.' });
    }

    
    const passwordHasheada = await bcrypt.hash(nuevaPassword, 12);

    // Actualizar datos del usuario
    usuario.password = passwordHasheada;
    usuario.tokenRecuperacion = undefined;
    usuario.expiracionTokenRecuperacion = undefined;
    await usuario.save();

    res.json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar la contraseña.' });
  }
};

exports.getUsuarios = getUsuarios;
exports.signup = signup;
exports.login = login;
exports.eliminarUsuario = eliminarUsuario;
exports.editarUsuario = editarUsuario;
exports.solicitarRecuperacionPassword = solicitarRecuperacionPassword;
exports.restablecerPassword = restablecerPassword;