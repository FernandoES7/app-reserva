import * as ClienteModel from '../models/Cliente.js';

export const listar = async (_req, res) => {

    try {

        const clientes =
            await ClienteModel.getAll();

        res.json({
            ok: true,
            data: clientes
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};