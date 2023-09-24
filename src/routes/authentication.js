const express = require('express');
const { Passport } = require('passport');
const router = express.Router();
const passport = require('passport');
const db = require("../database"); //db hace referencia a la BBDD
const queryObjetos = "select * from partidaobjetos po LEFT JOIN objetos o ON po.id_objeto=o.id";
const queryPartidasActivas = "select pej.id_partida,pej.id_jugador, pej.id_victima, pej.id_objeto,pej.asesinatos,p.titulo,p.descripcion,p.fecha_inicio,p.fecha_fin,p.activa,uv.full_name as victima,uv.pictureURL as foto_victima, ua.full_name as jugador ,o.nombre as objeto,o.descripcion as descripcion_objeto from partidasenjuego pej LEFT JOIN partidas p ON pej.id_partida=p.id LEFT JOIN usuarios uv ON uv.id=pej.id_victima LEFT JOIN objetos o ON o.id=pej.id_objeto LEFT JOIN usuarios ua ON ua.id=pej.id_jugador";
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
        successRedirect: '/',
        failureRedirect: '/signin',
        failureFlash: true

    })(req, res, next);
});

router.get('/logout', funciones.isAuthenticated, (req, res) => {
    req.logOut();
    res.redirect('/');
})

module.exports = router;