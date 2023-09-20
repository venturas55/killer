const express = require('express');
const { Passport } = require('passport');
const router = express.Router();
const passport = require('passport');
const db = require("../database"); //db hace referencia a la BBDD
const queryObjetos = "select * from partidaobjetos po LEFT JOIN objetos o ON po.id_objeto=o.id";
const queryPartidasActivas = "select pej.id_partida,pej.id_jugador,pej.victima as id_victima, pej.id_objeto,pej.asesinatos,p.titulo,p.descripcion,p.fecha_inicio,p.fecha_fin,p.activa,u.full_name as victima,u.pictureURL as foto_victima,o.nombre as objeto,o.descripcion as descripcion_objeto from partidasenjuego pej LEFT JOIN partidas p ON pej.id_partida=p.id LEFT JOIN usuarios u ON u.id=pej.victima LEFT JOIN objetos o ON o.id=pej.id_objeto";
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
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true

    })(req, res, next);
});

router.get('/profile', funciones.isAuthenticated, async (req, res) => {
    const objetos = await db.query(queryObjetos);
    const partidas = await db.query(queryPartidasActivas+ " where pej.id_jugador=?",[req.user.id]);
    console.log(partidas);
    res.render('profile', { objetos,partidas });
});
/* router.get('/profile/edit', funciones.isAuthenticated, (req, res) => {
    res.render('profileEdit');
});
router.post('/profile/edit/', funciones.isAuthenticated, async (req, res) => {
    const newUser = {
        usuario: req.body.usuario,
        contrasena: req.body.contrasena,
        email: req.body.email,
        full_name: req.body.fullname,
        privilegio: "san",
    };
    //newUser.contrasena = await funciones.encryptPass(password);
    console.log("guardando en la BBDD");
    //console.log(user);
    res.render('profile');
}); */

router.get('/logout', funciones.isAuthenticated, (req, res) => {
    req.logOut();
    res.redirect('/');
})



module.exports = router;