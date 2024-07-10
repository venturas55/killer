const express = require('express');
const router = express.Router();
const funciones = require("../lib/funciones");
const db = require("../database"); //db hace referencia a la BBDD


router.get('/profile', funciones.isAuthenticated, async (req, res) => {
    res.render('auth/profile');
});

router.get('/profile/edit', funciones.isAuthenticated, (req, res) => {
    res.render('auth/profileEdit');
});
router.post('/profile/edit', funciones.isAuthenticated, async (req, res) => {
    const {id,usuario,full_name,email}=req.body;
    let modUser = (db.query("select * from usuarios where id=?", [id]))[0];
    console.log(modUser);

    modUser = {
        usuario,
        email,
        full_name,
    };
    console.log(modUser);
    await db.query("update usuarios set ? where id=?", [modUser,id]);
    req.flash("success", "Datos modificados correctamente");
    res.redirect('/profile');
});

module.exports = router;