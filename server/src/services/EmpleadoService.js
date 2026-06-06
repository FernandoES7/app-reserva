import * as ClienteModel from '../models/Cliente.js';
import * as EmpleadoModel from '../models/Empleado.js';

export const promoverCliente = async (clienteId, rol = 'admin') => {
    const cliente = await ClienteModel.findById(clienteId);

    if (!cliente) {
        throw new Error('Cliente no encontrado');
    }

    const existente = await EmpleadoModel.findByEmailAny(cliente.email);

    if (existente) {
        await EmpleadoModel.actualizarRol(existente.id_empleado, rol);
        return EmpleadoModel.actualizarEstado(existente.id_empleado, 'activo');
    }

    return EmpleadoModel.crear({
        id_hotel: 1,
        nombre: cliente.nombre,
        email: cliente.email,
        password_hash: cliente.password_hash,
        telefono: cliente.telefono,
        rol,
    });
};
