import { Router } from 'express';
const router = Router();
import { createTransport } from 'nodemailer';
import funciones from '../lib/funciones.js';

router.get('/', async (req, res) => {
    res.render('index');
});  

router.get('/soporte', funciones.isAuthenticated,(req, res) => {
    res.render('soporte',{user:req.user});
});
router.post('/sendSugerencia', funciones.isAuthenticated,(req, res) => {
    const {titulo,descripcion} = req.body;
    req.user;
    const nombre = req.user.full_name;
    const usuario = req.user.usuario;
    const email = req.user.email;


    const transporter = createTransport({
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
        from: "KILLER GAME",
        to: process.env.EMAIL_ACCOUNT,
        subject: 'SUGERENCIA DE KILLER: '+ titulo,
        text: "Tienes un correo de ' "+ nombre + " ' que es usuario de tu aplicacion KILLER con el nombre de usuario: '"+usuario + " '.\n\n "+
        "A continuación se detalla el problema que te translada \n\n"
        + descripcion  +"\n\n"+
        "Su email es : "+ email
    };
    //console.log(mailOptions);

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error("Error:");
            console.log(error);
            req.flash("danger", "Error al enviar la sugerencia")
            res.redirect("/error");

        } else {
            console.log('Email sent: ' + info.response);
            req.flash("success", "Se ha enviado la sugerencia");
            res.redirect("/");
        }
    });
    res.redirect('/');
});

router.get('/error', async (req, res) => {
    res.render('error');
});

router.get('/confirmacion', async (req, res) => {
    res.render('confirmacion');
});  

router.get('/rechazo', async (req, res) => {
    res.render('rechazo');
});  

router.get('/prueba', async (req, res) => {
    res.render('prueba');
});


export default router;