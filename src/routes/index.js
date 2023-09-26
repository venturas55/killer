const express = require('express');
const router = express.Router();
const db = require("../database"); //db hace referencia a la BBDD
const queries = require("./queries");

const funciones = require('../lib/funciones');

router.get('/', async (req, res) => {
    res.render('index');
});



router.get('/pagina_aux1', (req, res) => {
    res.render('pagina_aux1');
});

router.get('/pagina_aux2', (req, res) => {
    res.render('pagina_aux2');
});

router.get('/profile', funciones.isAuthenticated, async (req, res) => {

    res.render('profile');
});

router.get('/error', async (req, res) => {
    res.render('error');
});

router.get('/profile/edit', funciones.isAuthenticated, (req, res) => {
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
});

module.exports = router;