import { createTransport } from 'nodemailer';
import { config } from '../config.js';

/**
 * Envía un correo de restablecimiento de contraseña.
 * @param {Object} req - Objeto de solicitud (para obtener host).
 * @param {Object} res - Objeto de respuesta (para redirecciones y mensajes).
 * @param {Object} user - Objeto de usuario con propiedad 'usuario'.
 * @param {string} user_id - ID del usuario.
 * @param {string} token - Token único para restablecer contraseña.
 * @param {string} email - Dirección de correo del destinatario.
 */
export function enviarCorreoRestablecerContrasena(req, res, user, user_id, token, email) {
  const transporter = createTransport({
    service: 'ovh',
    host: "smtp.mail.ovh.net",
    secure: true,
    port: 465,
    auth: {
      user: config.EMAIL_ACCOUNT,
      pass: config.EMAIL_PASS,
    }
  });

  const enlace = `http://${req.headers.host}/profile/email/verifypass/${user_id}/${token}`;

  const html = `
                <!DOCTYPE html>
                <html lang="es">
                <head><meta charset="UTF-8"><title>Restablecer Contraseña</title></head>
                <body style="background-color: #f8f9fa; padding: 20px; font-family: Arial, sans-serif; color: #212529;">
                  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 30px;">
                    <tr><td align="center" style="padding-bottom: 20px;"><h2 style="margin: 0; font-size: 24px;">Restablece tu contraseña ${user.usuario}</h2></td></tr>
                    <tr><td style="padding-bottom: 20px; font-size: 16px;">Hola, hemos recibido una solicitud para restablecer tu contraseña. Si tú no realizaste esta solicitud, puedes ignorar este correo.</td></tr>
                    <tr><td style="padding-bottom: 30px; font-size: 16px;">Para cambiar tu contraseña, haz clic en el siguiente botón:</td></tr>
                    <tr><td align="center" style="padding-bottom: 30px;">
                      <a href="${enlace}" style="background-color: #0d6efd; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px; display: inline-block;">Restablecer contraseña</a>
                    </td></tr>
                    <tr><td style="font-size: 14px; color: #6c757d;">Este enlace es válido por 24 horas. Si tienes problemas, copia y pega esta URL en tu navegador:<br><br>
                      <a href="${enlace}" style="color: #0d6efd; word-break: break-all;">${enlace}</a></td></tr>
                    <tr><td style="padding-bottom: 20px; font-size: 16px;">Recuerda que tu usuario es ${user.usuario}</td></tr>
                    <tr><td style="padding-top: 30px; font-size: 12px; color: #adb5bd; text-align: center;">
                      <span>Autoridad Portuaria de Valencia 2025</span>
                      <a rel="license" target="_blank" href="http://creativecommons.org/licenses/by/4.0/">
                        <img alt="Creative Commons License" src="cid:ccby"/>
                      </a><span>Autor: </span>
                      <a target="_blank" style="text-decoration:none;" href="https://guardiandelfaro.es">Guardian del Faro</a>
                      <span style="display: inline-block;transform: rotate(180deg);"> &copy; </span>
                      <span> bajo licencia </span><a rel="license" target="_blank" style="text-decoration:none;" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons.</a>
                    </td></tr>
                  </table>
                </body>
                </html>
                `;

  const mailOptions = {
    from: `"KILLER Support" <${config.EMAIL_ACCOUNT}>`,
    to: email,
    subject: 'Restablecer contraseña KILLER',
    replyTo: config.EMAIL_ACCOUNT,
    html
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error:", error);
      req.flash("danger", "Error al enviar el eMail para restablecer contraseña");
      res.redirect("/error");
    } else {
      console.log('Email sent: ' + info.response);
      req.flash("success", `Se ha enviado un token a la dirección de correo ${email} para restablecer contraseña.`);
      res.redirect("/");
    }
  });
}

export function enviarCorreo(req, res, destinatario, id_partida) {
  if (!destinatario || !destinatario.email || !destinatario.email.includes("@")) {
    console.error("❌ Email inválido o destinatario mal definido:", destinatario);
    req.flash("danger", "No se pudo enviar el correo porque el destinatario no es válido.");
    return res.redirect("back");
  }
  const transporter = createTransport({
    service: 'ovh',
    host: "smtp.mail.ovh.net",
    secure: true,
    port: 465,
    auth: {
      user: config.EMAIL_ACCOUNT,
      pass: config.EMAIL_PASS,
    }
  });

  const enlaceAccept = `http://${req.headers.host}/partidas/${id_partida}/muerte/${destinatario.id}`;
  const enlaceReject = `http://${req.headers.host}/partidas/${id_partida}/rejectkill/${destinatario.id}`;

  const html = `
                <!DOCTYPE html>
                <html lang="es">
                <head><meta charset="UTF-8"><title>Notificación de Eliminación</title></head>
                <body style="background-color: #f8f9fa; padding: 20px; font-family: Arial, sans-serif; color: #212529;">
                  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 30px;">
                    <tr><td align="center" style="padding-bottom: 20px;"><h2 style="margin: 0; font-size: 24px;">¡Notificación de Eliminación!</h2></td></tr>
                    <tr><td style="padding-bottom: 20px; font-size: 16px;">Hola ${destinatario.usuario}, tenemos malas noticias… <br>Te informamos que alguien ha notificado que has sido eliminado del juego en la partida con codigo ${id_partida}. 😱</td></tr>
                    <tr><td style="padding-bottom: 20px; font-size: 16px;">Esta acción puede ser consecuencia de las reglas del juego, decisiones de moderación, o simplemente porque el destino decidió que te tocaba salir. 😅</td></tr>
                    <tr><td style="padding-bottom: 30px; font-size: 16px;">Ttienes la oportunidad de confirmar que recibiste esta notificación y que te vas con honor! 🎮</td></tr>
                    <tr><td align="center" style="padding-bottom: 30px;">
                      <a href="${enlaceAccept}"
                        style="background-color: #28a745; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px; display: inline-block;">
                        Confirmar eliminación
                      </a>
                    </td></tr>
                    <tr><td style="padding-bottom: 20px; font-size: 16px;">Sin embargo, si no te gustó nada la idea de ser eliminado, si piensas que alguien ha mentido 🏴‍☠️, puedes rechazar esta notificación y seguir luchando:</td></tr>
                    <tr><td align="center" style="padding-bottom: 30px;">
                      <a href="${enlaceReject}"
                        style="background-color:rgb(118, 131, 5); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px; display: inline-block;">
                        Rechazar eliminación
                      </a>
                    </td></tr>
                    <tr><td style="font-size: 14px; color: #6c757d;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br><br>
                      <a href="${enlaceAccept}" style="color: #0d6efd; word-break: break-all;">
                        "${enlaceAccept}"
                      </a><br><br>
                      O si prefieres rebelarte contra el destino, aquí tienes el enlace para rechazar la eliminación:<br>
                      <a href="${enlaceReject}" style="color: #0d6efd; word-break: break-all;">
                        "${enlaceReject}"
                      </a>
                    </td></tr>
                    <tr><td style="padding-top: 30px; font-size: 12px; color: #adb5bd; text-align: center;">
                      <span>Autoridad Portuaria de Valencia 2025</span><br>
                      <a rel="license" target="_blank" href="http://creativecommons.org/licenses/by/4.0/">
                        <img alt="Creative Commons License" src="cid:ccby"/>
                      </a>
                      <span>Autor:</span> <a target="_blank" style="text-decoration:none;" href="https://guardiandelfaro.es">Guardian del Faro</a>
                      <span style="display: inline-block;transform: rotate(180deg);"> &copy; </span>
                      <span> bajo licencia </span><a rel="license" target="_blank" style="text-decoration:none;" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons.</a>
                    </td></tr>
                  </table>
                </body>
                </html>
                `;


  const mailOptions = {
    from: `"KILLER Support" <${config.EMAIL_ACCOUNT}>`,
    to: destinatario.email,
    subject: 'Has sido ELIMINADO en el juego KILLER',
    replyTo: config.EMAIL_ACCOUNT,
    html
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error:", error);
      req.flash("danger", "Error al enviar el eMail");
      res.redirect("back"); // Redirige a la misma página
    } else {
      console.log('Email sent: ' + info.response);
      req.flash("success", `Se ha enviado una notificacion a la victima  ${destinatario.full_name} ${destinatario.email}.`);
      res.redirect("back"); // Redirige a la misma página
    }
  });
}
