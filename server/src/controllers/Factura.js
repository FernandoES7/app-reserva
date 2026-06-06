import * as FacturaModel from '../models/Factura.js';

export const listarFacturas = async (_req,res) => {

    const facturas = await FacturaModel.listar();

    res.json({
        ok:true,
        data:facturas
    });

};

export const obtenerFactura = async (req,res) => {

    const factura = await FacturaModel.getById(req.params.id);

    if(!factura){
        return res.status(404).json({
            ok:false,
            message:'Factura no encontrada'
        });
    }

    res.json({
        ok:true,
        data:factura
    });

};