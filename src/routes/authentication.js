import { Router } from 'express';
import passport from 'passport';
const router = Router();
import funciones from '../lib/funciones.js';
import db from "../database.js"; //db hace referencia a la BBDD
import { enviarCorreoRestablecerContrasena } from '../lib/enviarCorreo.js';
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
            rows = await db.query("UPDATE tokens set hashedtoken=? , expires =NOW()+ interval 24 hour where user_id=?", [hash, user_id,]);
        } else {
            console.log("insert token: " + hash);
            rows = await db.query("INSERT INTO tokens (user_id,hashedtoken, expires) VALUES (?,?, NOW()+ interval 24 hour)", [user_id, hash]);
        }


        // Dentro de tu controlador
        enviarCorreoRestablecerContrasena(req, res, user, user.id, token, user.email);
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