const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
});

/**
 * Envía un correo electrónico de verificación al usuario
 * @param {Object} user - Objeto de usuario con correo y token
 * @param {String} verificationLink - Link completo para verificar la cuenta
 * @returns {Promise} - Resultado del envío
 */
const sendVerificationEmail = async (user, verificationLink) => {
  // Nombre de la empresa para la plantilla
  const companyName = 'PUBLIMPACTO';
  const companyColor = '#E60076';
  
  // Plantilla HTML para el correo
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verificación de Cuenta</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: ${companyColor};
        }
        .header img {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px;
          background-color: #f9f9f9;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #777;
          padding: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span style="color:#ffffff;font-weight:bold;">${companyName}</span>
        </div>
        <div class="content">
          <h2>¡Hola ${user.nombre}!</h2>
          <p>Gracias por registrarte en ${companyName}. Para completar tu registro y activar tu cuenta, por favor confirma tu dirección de correo electrónico.</p>
          <p style="text-align: center;">
            <a href="${verificationLink}" class="button" style="display:inline-block;padding:12px 24px;background-color:${companyColor};color:#ffffff;text-decoration:none;border-radius:4px;font-weight:bold;">Verificar mi correo</a>
          </p>
          <p>Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
          <p>${verificationLink}</p>
          <p>Este enlace expirará en 24 horas.</p>
          <p>Si no has solicitado esta cuenta, puedes ignorar este correo.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${companyName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Opciones del correo
  const mailOptions = {
    from: `"${companyName}" <${process.env.MAIL_USER}>`,
    to: user.correo,
    subject: `Verifica tu cuenta en ${companyName}`,
    html: htmlTemplate
  };

  // Enviar el correo
  return transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };