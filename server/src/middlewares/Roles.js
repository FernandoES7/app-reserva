export const autorizarRoles = (...rolesPermitidos) => {

    return (req, res, next) => {

        if (req.usuario.tipo !== 'empleado') {

            return res.status(403).json({
                ok: false,
                message: 'Acceso denegado'
            });
        }

        if (
            !rolesPermitidos.includes(
                req.usuario.rol
            )
        ) {

            return res.status(403).json({
                ok: false,
                message: 'Permisos insuficientes'
            });
        }

        next();
    };
};