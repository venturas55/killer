import { Router } from 'express';
import passport from 'passport';
const router = Router();
import { createTransport } from 'nodemailer';
import funciones from '../lib/funciones.js';
import db from "../database.js"; //db hace referencia a la BBDD
import {config} from "../config.js"
router.get('/signup', funciones.isNotAuthenticated, (req, res) => {
    res.render('auth/signup')
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    passReqToCallback: true,
    failureFlash: true
})
);

router.get('/signin', funciones.isNotAuthenticated, (req, res) => {
    res.render('auth/signin');
});

router.post('/signin', (req, res, next) => {
    passport.authenticate('local.signin', {
        successRedirect: '/partidas/listar',
        failureRedirect: '/signin',
        failureFlash: true

    })(req, res, next);
});

router.get('/logout', funciones.isAuthenticated, (req, res) => {
    req.logOut();
    res.redirect('/');
})


//GESTION recuperacion contraseña
router.get('/profile/email/recordarpass/', async (req, res) => {
    res.render('auth/recoverypass');
});
router.post('/profile/email/recordarpass/', async (req, res) => { //:email
    const email = req.body.email;
    var rows = await db.query("SELECT * FROM usuarios WHERE email= ?", [email]);
    if (rows.length > 0) {
        var user = rows[0];
        const user_id = user.id;
        var token = funciones.getCode();
        const hash = await funciones.encryptPass(token);
        console.log(hash);
        var hasAnyToken = await db.query("SELECT * FROM tokens WHERE user_id=?", [user_id]);
        if (hasAnyToken.length > 0) {
            rows = await db.query("UPDATE tokens set hashedtoken=? , expires =NOW()+ interval 25 minute where user_id=?", [hash, user_id,]);
        } else {
             console.log("insert token: "+hash);
            rows = await db.query("INSERT INTO tokens (user_id,hashedtoken, expires) VALUES (?,?, NOW()+ interval 25 minute)", [user_id, hash]);
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

        var mailOptions = {
            from: `"KILLER Support" <${config.EMAIL_ACCOUNT}>`,
            to: email,
            subject: 'Restablecer contraseña KILLER',
            replyTo: `${config.EMAIL_ACCOUNT}`,  // Agrega una dirección de respuesta válida
            html: ` 
            <!DOCTYPE html>
            <html lang="es">
                <head>
                <meta charset="UTF-8">
                <title>Restablecer Contraseña</title>
                </head>
                <body style="background-color: #f8f9fa; padding: 20px; font-family: Arial, sans-serif; color: #212529;">
                    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 30px;">
                        <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <h2 style="margin: 0; font-size: 24px;">Restablece tu contraseña ${user.usuario}</h2>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding-bottom: 20px; font-size: 16px; line-height: 1.5;">
                            Hola, hemos recibido una solicitud para restablecer tu contraseña. Si tú no realizaste esta solicitud, puedes ignorar este correo.
                        </td>
                        </tr>
                        <tr>
                        <td style="padding-bottom: 30px; font-size: 16px; line-height: 1.5;">
                            Para cambiar tu contraseña, haz clic en el siguiente botón:
                        </td>
                        </tr>
                        <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <a href="http://${req.headers.host}/profile/email/verifypass/${user_id}/${token}" 
                            style="background-color: #0d6efd; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px; display: inline-block;">
                            Restablecer contraseña
                            </a>
                        </td>

                        </tr>
                        <tr>
                        <td style="font-size: 14px; color: #6c757d;">
                            Este enlace es válido por 24 horas. Si tienes problemas, copia y pega esta URL en tu navegador:
                            <br><br>
                            <a href="http://${req.headers.host}/profile/email/verifypass/${user_id}/${token}" style="color: #0d6efd; word-break: break-all;">
                            http://${req.headers.host}/profile/email/verifypass/${user_id}/${token}
                            </a>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding-bottom: 20px; font-size: 16px; line-height: 1.5;">
                        Recuerda que tu usuario es ${user.usuario} 
                        </td>
                        </tr>
                        <tr>
                        <td style="padding-top: 30px; font-size: 12px; color: #adb5bd; text-align: center;">
                        <span>Autoridad Portuaria de Valencia 2025</span>
                            <a rel="license" target="_blank" href="http://creativecommons.org/licenses/by/4.0/">
                                <img alt="Creative Commons License" src="cid:ccby"/>
                            </a><span >Autor: </span> <a target="_blank" style="text-decoration:none;" href="https://guardiandelfaro.es">Guardian del Faro </a>
                            <span style="display: inline-block;transform: rotate(180deg);"> &copy; </span>
                            <span> bajo licencia</span> <a rel="license" target="_blank" style="text-decoration:none;" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons.</a>
                        </td>
                        </tr>
                    </table>
                </body>
            </html>
            `
        };
        //console.log(mailOptions);

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error("Error:");
                console.log(error);
                req.flash("danger", "Error al enviar el eMail para restablecer contraseña")
                res.redirect("/error");

            } else {
                console.log('Email sent: ' + info.response);
                req.flash("success", `Se ha enviado un token a la dirección de correo ${email} para restablecer contraseña.`);
                res.redirect("/");
            }
        });
    } else {
        console.log("No existe ningún usuario con el correo proporcionado.");
        req.flash("danger", "No existe ningún usuario con el correo proporcionado.")
        res.redirect("/error");
    }

});
router.get('/profile/email/verifypass/:user_id/:code', async (req, res) => {
    const { user_id, code } = req.params;
    await db.query("DELETE FROM tokens WHERE expires < NOW()");
    var [token] = await db.query("SELECT * FROM tokens WHERE user_id=? ", [user_id]);
    console.log(token);
   
    if (token) {

        const validToken = await funciones.verifyPassword(code, token.hashedtoken)
        console.log(validToken);
        if (validToken) {
            req.flash("success", "Token proporcionado correcto");
            res.redirect("/profile/recoverysetpass/" + user_id);
        }
        else {
            req.flash("danger", "Token proporcionado incorrecto");
            res.redirect("/error");
        }
    } else {
        req.flash("danger", "Token proporcionado expirado"); //TODO: NO REDIRECIONA
        res.redirect("/error");
    }
});
router.get('/profile/recoverysetpass/:id', async (req, res) => {
    const { id } = req.params;
    res.render("auth/recoverysetnewpass", { id });
});
router.post('/profile/recoverysetpass', async (req, res) => {
    const { password, id } = req.body;
    //console.log(password + " "+ id);
    var encryptedPass = await funciones.encryptPass(password);
    const result = await db.query("UPDATE usuarios set contrasena=? where id=?", [encryptedPass, id]);
    req.flash("success", "Contraseña actualizada correctamente");
    res.redirect("/");
});
export default router;