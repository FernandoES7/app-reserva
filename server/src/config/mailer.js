import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// ── Transporter ───────────────────────────────────────────────────────────────
// Para desarrollo usa Mailtrap (https://mailtrap.io) → crea cuenta gratis,
// copia las credenciales SMTP en tu .env y los correos aparecen en la bandeja
// de pruebas sin enviarse realmente.
//
// Variables necesarias en .env:
//   MAIL_HOST=sandbox.smtp.mailtrap.io
//   MAIL_PORT=2525
//   MAIL_USER=<tu_user_mailtrap>
//   MAIL_PASS=<tu_pass_mailtrap>
//   MAIL_FROM="Hostal Boutique <noreply@hostaljl.com>"

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   Number(process.env.MAIL_PORT) || 2525,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ── Plantilla de recuperación ─────────────────────────────────────────────────
export const enviarCorreoRecuperacion = async ({ email, nombre, resetUrl }) => {
  await transporter.sendMail({
    from:    process.env.MAIL_FROM || '"Hostal Boutique" <noreply@hostaljl.com>',
    to:      email,
    subject: 'Recuperación de contraseña — Hostal Boutique José Luis',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8" /></head>
      <body style="margin:0;padding:0;background:#f0f4ff;font-family:Georgia,serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:40px 20px;">
            <table width="520" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,58,110,.12);">
              <!-- Header -->
              <tr>
                <td style="background:#1e3a6e;padding:28px 36px;text-align:center;">
                  <span style="display:inline-flex;align-items:center;justify-content:center;
                    width:44px;height:44px;border-radius:10px;background:#1e3a6e;
                    border:2px solid #f59e0b;font-weight:bold;font-size:15px;
                    color:#f59e0b;letter-spacing:1px;">JL</span>
                  <p style="color:#fff;margin:10px 0 0;font-size:18px;font-weight:bold;">
                    Hostal Boutique José Luis
                  </p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:36px;">
                  <p style="color:#1e3a6e;font-size:22px;font-weight:bold;margin:0 0 12px;">
                    Hola, ${nombre} 👋
                  </p>
                  <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                    Haz clic en el botón de abajo para continuar.
                    Este enlace expira en <strong>1 hora</strong>.
                  </p>
                  <div style="text-align:center;margin:28px 0;">
                    <a href="${resetUrl}"
                       style="background:#1e3a6e;color:#fff;text-decoration:none;
                              padding:14px 32px;border-radius:10px;font-size:15px;
                              font-weight:bold;display:inline-block;">
                      Restablecer contraseña
                    </a>
                  </div>
                  <p style="color:#999;font-size:13px;line-height:1.5;margin:0;">
                    Si no solicitaste este cambio, ignora este correo.
                    Tu contraseña no será modificada.<br/><br/>
                    O copia este enlace en tu navegador:<br/>
                    <span style="color:#1e3a6e;word-break:break-all;">${resetUrl}</span>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;padding:18px 36px;text-align:center;
                            border-top:1px solid #e2e8f0;">
                  <p style="color:#aaa;font-size:12px;margin:0;">
                    © 2025 Hostal Boutique José Luis · Av. José Larco 1234, Miraflores, Lima
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};
