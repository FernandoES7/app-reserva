import * as PagoModel from '../models/Pago.js';
import * as FacturaModel from '../models/Factura.js';

export const registrarPago = async (req,res) => {

    try{

        const {
            idFactura,
            monto,
            referencia
        } = req.body;

        const factura = await FacturaModel.getById(idFactura);

        if(!factura){

            return res.status(404).json({
                ok:false,
                message:'Factura no encontrada'
            });

        }

        const totalPagado =
            await PagoModel.totalPagado(idFactura);

        const pendiente =
            factura.total - totalPagado;

        if(monto > pendiente){

            return res.status(400).json({
                ok:false,
                message:'El monto excede el saldo pendiente'
            });

        }

        const pago =
            await PagoModel.crear({
                idFactura,
                monto,
                referencia
            });

        res.status(201).json({
            ok:true,
            data:pago
        });

    }catch(error){

        console.error(error);

        res.status(500).json({
            ok:false,
            message:error.message
        });

    }
};

export const listarPagos = async (_req,res) => {

    const pagos = await PagoModel.listar();

    res.json({
        ok:true,
        data:pagos
    });

};

export const pagosFactura = async (req,res) => {

    const pagos =
        await PagoModel.getByFactura(req.params.idFactura);

    res.json({
        ok:true,
        data:pagos
    });

};