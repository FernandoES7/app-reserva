import jwt from 'jsonwebtoken';
import * as UsuarioModel from '../models/Usuario.js';
import { enviarCorreoRecuperacion } from '../config/mailer.js';

const generarToken = (usuario) =>
  jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const PASSWORD_MSG =
  'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial';

// POST /api/auth/register
export const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ ok: false, message: 'Nombre, email y contraseña son requeridos' });
  }

  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({ ok: false, message: PASSWORD_MSG });
  }

  try {
    const existente = await UsuarioModel.findByEmail(email);
    if (existente) {
      return res.status(409).json({ ok: false, message: 'Este correo ya está registrado' });
    }

    const usuario = await UsuarioModel.crear({ nombre, email, password });
    const token   = generarToken(usuario);

    res.status(201).json({ ok: true, data: { usuario, token } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al registrar usuario' });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email y contraseña requeridos' });
  }

  try {
    const usuario = await UsuarioModel.findByEmail(email);
    if (!usuario) {
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas' });
    }

    const passwordOk = await UsuarioModel.verificarPassword(password, usuario.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas' });
    }

    const { password_hash, reset_token, reset_token_expires, ...usuarioSeguro } = usuario;
    const token = generarToken(usuarioSeguro);

    res.json({ ok: true, data: { usuario: usuarioSeguro, token } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al iniciar sesión' });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ ok: false, message: 'Email requerido' });

  try {
    const usuario = await UsuarioModel.findByEmail(email);

    // Siempre respondemos igual para no revelar si el email existe
    if (!usuario) {
      return res.json({ ok: true, message: 'Si el correo existe, recibirás las instrucciones.' });
    }

    const token     = await UsuarioModel.setResetToken(email);
    const resetUrl  = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    await enviarCorreoRecuperacion({
      email,
      nombre:   usuario.nombre,
      resetUrl,
    });

    res.json({ ok: true, message: 'Si el correo existe, recibirás las instrucciones.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al procesar la solicitud' });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ ok: false, message: 'Token y nueva contraseña requeridos' });
  }

  try {
    const ok = await UsuarioModel.resetPassword(token, password);
    if (!ok) {
      return res.status(400).json({ ok: false, message: 'Token inválido o expirado' });
    }
    res.json({ ok: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error al restablecer contraseña' });
  }
};
