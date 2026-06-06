import * as AuthService from '../services/AuthService.js';
import * as ClienteModel from '../models/Cliente.js';
import { generarToken } from '../utils/jwt.js';

export const login = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            ok: false,
            message: 'Email y contraseña requeridos'
        });
    }

    try {

        const usuario =
            await AuthService.login(
                email,
                password
            );

        const token =
            generarToken(usuario);

        return res.json({
            ok: true,
            data: {
                usuario,
                token
            }
        });

    } catch (error) {

        return res.status(401).json({
            ok: false,
            message: error.message
        });
    }
};

export const register = async (req, res) => {

  const {
      nombre,
      email,
      password,
      telefono,
      documento
  } = req.body;

  if (
      !nombre ||
      !email ||
      !password ||
      !documento
  ) {

      return res.status(400).json({
          ok: false,
          message: 'Datos incompletos'
      });
  }

  try {

      const existe =
          await ClienteModel.findByEmail(email);

      if (existe) {

          return res.status(409).json({
              ok: false,
              message: 'Correo ya registrado'
          });
      }

      const docExiste = await ClienteModel.findByDocumento(documento);

      if (docExiste) {
          return res.status(409).json({
              ok: false,
              message: 'Documento ya registrado'
          });
      }

      const cliente =
          await ClienteModel.crear({
              nombre,
              email,
              password,
              telefono,
              documento
          });

      const usuario = {
          id: cliente.id_cliente,
          nombre: cliente.nombre,
          email: cliente.email,
          documento: cliente.documento,
          tipo: 'cliente'
      };

      const token = generarToken(usuario);

      res.status(201).json({
          ok: true,
          data: {
              usuario,
              token
          }
      });

  } catch (error) {

      console.error(error);

      res.status(500).json({
          ok: false,
          message: 'Error al registrar cliente'
      });
  }
};

export const forgotPassword = async (req, res) => {

};

export const me = async (req, res) => {
    try {
        if (req.usuario.tipo === 'empleado') {
            return res.json({
                ok: true,
                data: {
                    id: req.usuario.id,
                    nombre: req.usuario.nombre,
                    email: req.usuario.email,
                    rol: req.usuario.rol,
                    tipo: 'empleado',
                },
            });
        }

        const cliente = await ClienteModel.findByEmail(req.usuario.email);
        if (!cliente) {
            return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
        }

        return res.json({
            ok: true,
            data: {
                id: cliente.id_cliente,
                nombre: cliente.nombre,
                email: cliente.email,
                documento: cliente.documento,
                telefono: cliente.telefono,
                tipo: 'cliente',
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Error al obtener perfil' });
    }
};

export const resetPassword = async (req, res) => {

};