import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import db from "../database.js";
import funciones from "../lib/funciones.js";

passport.use(
    "local.signin",
    new LocalStrategy(
        {
            //name del formulario
            usernameField: "usuario",
            passwordField: "password",
            passReqToCallback: true,
        },
        async (req, username, password, done) => {
            const rows = await db.query("SELECT * FROM usuarios WHERE usuario= ?", [username]);

            if (rows.length > 0) {
                const user = rows[0];
                //console.log(user);
                //var prueba = funciones.encryptPass(user.contrasena);
                //console.log("Pass "+prueba);
                const validPassword = await funciones.verifyPassword(password, user.contrasena);
                if (validPassword)
                    done(null, user, req.flash('success', "Welcome " + user.usuario));
                else
                    done(null, false, req.flash('danger', "El password introducido es incorrecto"));
            } else {
                return done(null, false, req.flash('danger', "Ese usuario no existe"));
            }
        }
    )
);

passport.use(
    "local.signup",
    new LocalStrategy(
        {
            usernameField: "usuario",
            passwordField: "password",
            passReqToCallback: true,
        },
        async (req, username, password, done) => {
            //const { cuerpo } = req.body;
            const newUser = {
                usuario: username,
                contrasena: password,
                email: req.body.email,
                full_name: req.body.fullname,
                privilegio: "none",
            };
            newUser.contrasena = await funciones.encryptPass(password);
            const yaExiste = await db.query("SELECT * FROM usuarios WHERE usuario=?", newUser.usuario);
            if (yaExiste[0]) {
                console.log(yaExiste[0].usuario);
                console.log("Ya existe");
                return done(null, false, req.flash('danger', 'El usuario ya existe! Puebe con otro nombre de usuario.'));
            }
            else {
                console.log("No existe");
                console.log("newUser");
                const result = await db.query("INSERT INTO usuarios SET ?", [newUser]);
                newUser.id = result.insertId;
                console.log(result);
                return done(null, newUser);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [user] = await db.query("SELECT * FROM usuarios WHERE id = ?", [id]);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
