import pool from '../database/connection.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const crear = async ({
    nombre,
    email,
    password,
    telefono,
    documento
}) => {

    const passwordHash =
        await bcrypt.hash(password, 10);

    const [result] = await pool.query(
        `
        INSERT INTO cliente
        (
            nombre,
            email,
            password_hash,
            telefono,
            documento
        )
        VALUES (?,?,?,?,?)
        `,
        [
            nombre,
            email,
            passwordHash,
            telefono || null,
            documento
        ]
    );

    return findById(result.insertId);
};

export const findById = async (id) => {

    const [rows] = await pool.query(
        `
        SELECT
            id_cliente,
            nombre,
            email,
            password_hash,
            telefono,
            documento,
            estado
        FROM cliente
        WHERE id_cliente = ?
        `,
        [id]
    );

    return rows[0] || null;
};

export const findByEmail = async (email) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM cliente
        WHERE email = ?
        `,
        [email]
    );

    return rows[0] || null;
};

export const findByDocumento = async (documento) => {
    if (!documento) return null;

    const [rows] = await pool.query(
        `
        SELECT *
        FROM cliente
        WHERE documento = ?
        `,
        [documento]
    );

    return rows[0] || null;
};

export const getAll = async () => {

    const [rows] = await pool.query(
        `
        SELECT
            c.*,
            COUNT(r.id_reserva) AS total_reservas
        FROM cliente c
        LEFT JOIN reserva r
            ON r.id_cliente = c.id_cliente
        GROUP BY c.id_cliente
        ORDER BY c.created_at DESC
        `
    );

    return rows;
};

export const eliminar = async (id) => {

    const [result] = await pool.query(
        `
        UPDATE cliente
        SET estado='inactivo'
        WHERE id_cliente=?
        `,
        [id]
    );

    return result.affectedRows > 0;
};

export const setResetToken = async (email) => {

  const token =
      crypto.randomBytes(32).toString('hex');

  const expires =
      new Date(Date.now() + 3600000);

  const [result] = await pool.query(
      `
      UPDATE cliente
      SET
          reset_token=?,
          reset_token_expires=?
      WHERE email=?
      `,
      [
          token,
          expires,
          email
      ]
  );

  if (!result.affectedRows) {
      return null;
  }

  return token;
};

export const resetPassword =
async (token, nuevaPassword) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM cliente
        WHERE reset_token = ?
        AND reset_token_expires > NOW()
        `,
        [token]
    );

    if (!rows.length) {
        return false;
    }

    const hash =
        await bcrypt.hash(
            nuevaPassword,
            10
        );

    await pool.query(
        `
        UPDATE cliente
        SET
            password_hash=?,
            reset_token=NULL,
            reset_token_expires=NULL
        WHERE id_cliente=?
        `,
        [
            hash,
            rows[0].id_cliente
        ]
    );

    return true;
};

export const findOrCreate = async ({ nombre, apellido, email, telefono, dni }) => {
    const nombreCompleto = [nombre, apellido].filter(Boolean).join(' ').trim();
    const emailNorm = email?.trim();
    const documento = dni?.trim();

    let existente = emailNorm ? await findByEmail(emailNorm) : null;
    if (!existente && documento) {
        existente = await findByDocumento(documento);
    }

    if (existente) {
        await pool.query(
            `
            UPDATE cliente
            SET nombre = ?, telefono = COALESCE(?, telefono)
            WHERE id_cliente = ?
            `,
            [nombreCompleto || existente.nombre, telefono || null, existente.id_cliente]
        );
        return {
            id: existente.id_cliente,
            ...existente,
            nombre: nombreCompleto || existente.nombre,
            telefono: telefono || existente.telefono,
        };
    }

    const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

    const [result] = await pool.query(
        `
        INSERT INTO cliente (nombre, email, password_hash, telefono, documento)
        VALUES (?, ?, ?, ?, ?)
        `,
        [nombreCompleto, emailNorm, passwordHash, telefono || null, documento]
    );

    return { id: result.insertId, nombre: nombreCompleto, email: emailNorm, telefono, documento };
};