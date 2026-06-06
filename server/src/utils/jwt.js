import jwt from 'jsonwebtoken';

export const generarToken = (usuario) => {

    return jwt.sign(
        {
            id: usuario.id,
            tipo: usuario.tipo,
            rol: usuario.rol,
            email: usuario.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn:
                process.env.JWT_EXPIRES_IN || '7d'
        }
    );
};