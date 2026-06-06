import * as ClienteModel from '../models/Cliente.js';
import * as EmpleadoModel from '../models/Empleado.js';
import bcrypt from 'bcryptjs';

export const login = async (email, password) => {

    // Buscar empleado
    const empleado = await EmpleadoModel.findByEmail(email);

    if (empleado) {

        const valido = await bcrypt.compare(
            password,
            empleado.password_hash
        );

        if (!valido) {
            throw new Error('Credenciales incorrectas');
        }

        return {
            id: empleado.id_empleado,
            nombre: empleado.nombre,
            email: empleado.email,
            tipo: 'empleado',
            rol: empleado.rol
        };
    }

    // Buscar cliente
    const cliente = await ClienteModel.findByEmail(email);

    if (cliente) {

        const valido = await bcrypt.compare(
            password,
            cliente.password_hash
        );

        if (!valido) {
            throw new Error('Credenciales incorrectas');
        }

        return {
            id: cliente.id_cliente,
            nombre: cliente.nombre,
            email: cliente.email,
            documento: cliente.documento,
            tipo: 'cliente'
        };
    }

    throw new Error('Credenciales incorrectas');
};