import express, { urlencoded, json, static as _static } from 'express';
import morgan from 'morgan';
import { engine } from 'express-handlebars'; //Para usar plantillas
import { join } from 'path';               //Para manejar directorios, basicamente unirlos 
import flash from 'connect-flash';  //Para mostar mensajes
import session from 'express-session'; //Lo necesita el flash tb
import MySQLstore from 'express-mysql-session'; // para poder guardar la sesion en la sql
import { config } from './config.js';
import * as path from "path";
import * as url from "url";
import passport from "passport";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

//Initialization
const app = express();
import './lib/passport.js'; //para que se entere de la autentificacion que se ha crea do 

//Settings
app.set('port',process.env.PORT || 4000);
app.set('views', join(__dirname,'views'));
app.engine('.hbs', engine({  //con esto se configura el app.engine
    defaultLayout: 'main',
    layoutDir: path.join(app.get('views'),'layouts'),
    partialsDir: path.join(app.get('views'),'partials'),
    extname: '.hbs',
    helpers: './lib/handlebars.js' //no hay nada aun
}));
app.set('view engine','.hbs'); //Para utilizar el app.engine


//Middleware
app.use(session({
    secret: 'mysesion',
    resave: false,
    saveUninitialized:false,
    store: new MySQLstore(config.database)
}))
app.use(flash());       // Para poder usar el middleware de enviar mensajes popups
app.use(morgan('dev'));
app.use(urlencoded({extended:false})); //aceptar los datos desde los formularios sin aceptar imagenes ni nada raro
app.use(json()); //Para enviar y recibir jsons.
app.use(passport.initialize()); //iniciar passport
app.use(passport.session());    //para que sepa donde guardar y como manejar los datos


//Variables globales
app.use((req,res,next) =>{
    app.locals.signupMessage = req.flash('signupMessage');
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.warning = req.flash('warning');
    app.locals.error = req.flash('error');
    app.locals.user = req.user;
    next();
});

//Routes
import rutas from "./routes/index.js";
import rutasAuth from "./routes/authentication.js";
import rutasPartidas from "./routes/partida.js";
import rutasApi from "./routes/api.js";
import rutasFotos from "./routes/fotos.js";
import rutasPayments from "./routes/payments.js";
import rutasProfile from "./routes/profile.js";
import rutasComunicados from "./routes/comunicado.js";
app.use(rutas);
app.use(rutasAuth);
app.use('/partidas',rutasPartidas);
app.use(rutasApi);
app.use(rutasFotos);
app.use(rutasPayments);
app.use(rutasProfile);
app.use('/comunicados',rutasComunicados);


//Public
app.use(_static(join(__dirname,'public')));
/* app.use(
    express.static(path.join(__dirname, "../node_modules/bootstrap/dist/"))
  ); */
//Starting
app.listen(app.get('port'),()=>{
    console.log("Running on http://localhost:"+ app.get('port'));
})