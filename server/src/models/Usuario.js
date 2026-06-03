import pool from '../database/connection.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Crear usuario nuevo
export const crear = async ({ nombre, email, password }) => {
  const password_hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?,?,?)',
    [nombre, email, password_hash]
  );
  const [rows] = await pool.query('SELECT id, nombre, email, rol FROM usuarios WHERE id = ?', [result.insertId]);
  return rows[0];
};

// Buscar por email (incluye hash para comparar)
export const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ? AND activo = TRUE', [email]);
  return rows[0] || null;
};

// Verificar contraseña
export const verificarPassword = (password, hash) => bcrypt.compare(password, hash);

// Generar token de reset
export const setResetToken = async (email) => {
  const token   = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  const [result] = await pool.query(
    'UPDATE usuarios SET reset_token = ?, reset_token_expires = ? WHERE email = ? AND activo = TRUE',
    [token, expires, email]
  );
  if (result.affectedRows === 0) return null;
  return token;
};

// Verificar y consumir token de reset
export const resetPassword = async (token, nuevaPassword) => {
  const [rows] = await pool.query(
    'SELECT * FROM usuarios WHERE reset_token = ? AND reset_token_expires > NOW() AND activo = TRUE',
    [token]
  );
  if (!rows.length) return false;

  const hash = await bcrypt.hash(nuevaPassword, 10);
  await pool.query(
    'UPDATE usuarios SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
    [hash, rows[0].id]
  );
  return true;
};
