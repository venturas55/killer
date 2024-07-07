const express = require('express');
const { Passport } = require('passport');
const router = express.Router();
const passport = require('passport');
const db = require("../database"); //db hace referencia a la BBDD
const funciones = require('../lib/funciones');

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
    const usuario = req.body.usuario;
    // console.log(email + " " + usuario);
    var rows = await db.query("SELECT * FROM usuarios WHERE usuario=? AND email= ?", [usuario, email]);
    if (rows.length > 0) {
        var user = rows[0];
        const user_id = user.id;


        var token = helpers.getCode();
        const hash = await helpers.encryptPass(token);
        //console.log(hash);
        var hasAnyToken = await db.query("SELECT * FROM tokens WHERE user_id=?", [user_id]);
        if (hasAnyToken.length > 0) {
            rows = await db.query("UPDATE tokens set hashedtoken=? , expires =NOW()+ interval 5 minute where user_id=?", [hash, user_id,]);
        } else {
            rows = await db.query("INSERT INTO tokens (user_id,hashedtoken, expires) VALUES (?,?, NOW()+ interval 5 minute)", [user_id, hash]);
        }

        //var exito = await helpers.sendRecoveryMail(email,token); NOFUNCIONA 
        //console.log(email + " " + token);
        //console.log(process.env.EMAIL_ACCOUNT + " " + process.env.EMAIL_PASS);
        const transporter = nodemailer.createTransport({
            service: 'ovh',
            host: "smtp.mail.ovh.net",
            secure: true,
            port: 465,

            auth: {
                user: process.env.EMAIL_ACCOUNT,
                pass: process.env.EMAIL_PASS,
            }
        });

        var mailOptions = {
            from: "BBDD SAN",
            to: email,
            subject: 'Restablecer contraseña BBDD SAN',
            text: 'Has olvidado tu contraseña. Haz click en el siguiente vinculo http://localhost:5001/profile/email/verifypass/' + user_id + '/' + token + " para reestablecer una nueva contraseña.",
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
                req.flash("success", "Se ha enviado un token a la dirección de correo asociada para restablecer contraseña.");
                res.redirect("/");
            }
        });
    } else {
        req.flash("danger", "El usuario y/o el correo no corresponden con ningún usuario.")
        res.redirect("/error");
    }

});
router.get('/profile/email/verifypass/:user_id/:code', async (req, res) => {
    const { user_id, code } = req.params;
    await db.query("DELETE FROM tokens WHERE expires < NOW()");
    var [token] = await db.query("SELECT * FROM tokens WHERE user_id=? ", [user_id]);
    console.log(token);
    //  localhost:5001/profile/email/verifypass/1/1ZEFGJ      hashedtoken
    //console.log(code + " == " + token.hashedtoken);
    if (token) {

        const validToken = await helpers.verifyPassword(code, token.hashedtoken)
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
    var encryptedPass = await helpers.encryptPass(password);
    const result = await db.query("UPDATE usuarios set contrasena=? where id=?", [encryptedPass, id]);
    req.flash("success", "Contraseña actualizada correctamente");
    res.redirect("/");
});
module.exports = router;