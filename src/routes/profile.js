import { Router } from 'express';
import { resolve } from 'path';
import fs from 'fs';
const router = Router();
import funciones from "../lib/funciones.js";
import db from "../database.js"; //db hace referencia a la BBDD


router.get('/profile', funciones.isAuthenticated, async (req, res) => {
    res.render('auth/profile');
});
router.get('/profile/edit', funciones.isAuthenticated, (req, res) => {
    res.render('auth/profileEdit');
});
router.post('/profile/edit', funciones.isAuthenticated, async (req, res) => {
    const { id, usuario, full_name, email } = req.body;
    let modUser = (db.query("select * from usuarios where id=?", [id]))[0];
    console.log(modUser);

    modUser = {
        usuario,
        email,
        full_name,
    };
    console.log(modUser);
    await db.query("update usuarios set ? where id=?", [modUser, id]);
    req.flash("success", "Datos modificados correctamente");
    res.redirect('/profile');
});
router.post("/profile/delete/:id", funciones.isAuthenticated, async (req, res, next) => {
    const { id } = req.params;

    if (req.user.id != id) {
        req.flash("warning", "Error al intentar la operación");
        return res.redirect('/profile');
    }

    try {
        const userRows = await db.query("SELECT * FROM usuarios WHERE id=?", [id]);
        const user = userRows[0];
        if (user?.pictureURL) {
            const filePath = resolve('src/public/img/profiles/' + user.pictureURL);
            try {
                await fs.promises.access(filePath);
                await fs.promises.unlink(filePath);
                console.log("Foto de perfil eliminada");
            } catch (err) {
                console.log("No tiene foto de perfil o ya fue eliminada");
            }
        }
        req.logOut();
        await db.query("DELETE FROM usuarios WHERE id=?", [id]);

        req.flash("success", "Usuario borrado correctamente");
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash("error", "Ocurrió un error al eliminar el usuario");
        res.redirect('/profile');
    }
});
router.get('/profile/changepass', async (req, res) => {
    const { id } = req.params;
    res.render("auth/changepass", { id });
});
router.post('/profile/changepass', async (req, res) => {

    const { newcontrasena, newcontrasena2, oldcontrasena, id } = req.body;
    //console.log(password + " "+ id);
    const rows = await db.query("SELECT * FROM usuarios WHERE id= ?", [req.body.id]);
    var user = rows[0];
    console.log(oldcontrasena + " / " + user.contrasena);
    const validPassword = await funciones.verifyPassword(oldcontrasena, user.contrasena);
    if (validPassword) {
        if (newcontrasena === newcontrasena2) {
            var encryptedPass = await funciones.encryptPass(newcontrasena);
            console.log("guardando en la BBDD");
            console.log(newcontrasena + " " + encryptedPass);
            await db.query("UPDATE usuarios set contrasena=? where id=?", [encryptedPass, id]);
            req.flash("success", "Contraseña actualizada correctamente");
            res.redirect("/profile/edit");
        } else {
            req.flash("warning", "Las contraseñas no coinciden");
            res.redirect("/profile/edit");
        }

    } else {
        req.flash("warning", "No has puesto la contraseña actual correctamente!");
        res.redirect('/noperm');
    }
});

export default router;