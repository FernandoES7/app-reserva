import * as EmpleadoModel from '../models/Empleado.js';
import * as EmpleadoService from '../services/EmpleadoService.js';

export const listar = async (_req, res) => {

    try {

        const empleados =
            await EmpleadoModel.getAll();

        res.json({
            ok: true,
            data: empleados
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

export const promover = async (req, res) => {
    const { rol = 'admin' } = req.body;

    try {
        const empleado = await EmpleadoService.promoverCliente(req.params.id, rol);

        res.json({
            ok: true,
            message: 'Cliente promovido a empleado correctamente',
            data: empleado,
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message,
        });
    }
};

export const actualizarEstado = async (req, res) => {
    const { estado } = req.body;
    const estadosValidos = ['activo', 'inactivo'];

    if (!estado || !estadosValidos.includes(estado)) {
        return res.status(400).json({
            ok: false,
            message: 'Estado inválido',
        });
    }

    try {
        const empleado = await EmpleadoModel.actualizarEstado(req.params.id, estado);

        if (!empleado) {
            return res.status(404).json({
                ok: false,
                message: 'Empleado no encontrado',
            });
        }

        res.json({
            ok: true,
            message: `Empleado marcado como ${estado}`,
            data: empleado,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message,
        });
    }
};

export const desactivar = async (
    req,
    res
) => {

    try {

        const ok =
            await EmpleadoModel.desactivar(
                req.params.id
            );

        if (!ok) {

            return res.status(404).json({
                ok: false,
                message:
                    'Empleado no encontrado'
            });
        }

        res.json({
            ok: true,
            message:
                'Empleado desactivado'
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};