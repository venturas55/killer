import bcryptjs from 'bcryptjs';
import { join } from 'path';
import { statSync, readdir } from 'fs';
import db from "../database.js";
import queries from "../routes/queries.js";
import mysqldump from 'mysqldump';
import { stringify } from 'querystring';
const funciones = {};

function createdDate(file) {
    const { birthtime } = statSync(file)
    return birthtime
}

funciones.listadoFotos = (req, res, next) => {
    const nif = req;
    var fotitos = [];
    var directorio = join(__dirname, "../public/img/imagenes", nif);
    readdir(directorio, (err, files) => {
        if (files) {
            files.forEach(file => {
                fotitos.push(file);
            });
        }
    });
    return fotitos;
}

funciones.listadoBackups = (req, res, next) => {
    var documentos = [];
    var directorio = join(__dirname, "../public/dumpSQL");
    readdir(directorio, (err, files) => {
        if (files) {
            files.forEach(file => {
                var item = {
                    'name': file,
                    'created_at': createdDate(directorio + "/" + file)
                }
                documentos.push(item);
            });
        } else {
            console.log("No hay files");
        }
    });
    return documentos;
}

funciones.encryptPass = async (password) => {
    const sal = await bcryptjs.genSalt(10);
    password = await bcryptjs.hash(password, sal);
    return password;
}

funciones.verifyPassword = async (password, hashedPassword) => {
    try {
        return await compare(password, hashedPassword);
    } catch (e) {
        console.log(e);
    }
}

funciones.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/signin');
}

funciones.isNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/profile');
}

funciones.isAdmin = (req, res, next) => {
    if (req.user && req.user.privilegio == "admin") {
        return next();
    }
    var error = "No tienes permisos. Solo el admin puede realizar esta gestión";
    return res.render('error', { error });
}

funciones.hasPermission = async (req, res, next) => {
    //BIEN LEE POR PARAMS O POR BODY
    var id_partida = req.params.id_partida;
    if (id_partida == null)
        id_partida = req.body.id_partida;
    const partida = (await db.query("select * from partidas where id = ?", [id_partida]))[0];
    //console.log(partida);
    //si es admin
    if (req.user && req.user.privilegio == "admin") {
        return next();
    }
    //Si es el creador de la partida
    if (partida.id_creador == req.user.id)
        return next();
    //si opera sobre el mismo.
    if (req.params.id_jugador && req.params.id_jugador == req.user.id)
        return next();

    var error = "No tienes permisos";
    return res.render('error', { error });
}

funciones.esCreadorPartida = async (req, res, next) => {
    //BIEN LEE POR PARAMS O POR BODY
    var id_partida = req.params.id_partida;
    if (id_partida == null)
        id_partida = req.body.id_partida;
    const partida = (await db.query("select * from partidas where id = ?", [id_partida]))[0];
    //console.log(partida);
    //Si es el creador de la partida
    if (partida.id_creador == req.user.id)
        return next();
    var error = "No tienes permisos";
    return res.render('error', { error });
}

funciones.isNotAdmin = (req, res, next) => {
    if (!req.user.privilegio == "admin") {
        return next();
    }
    var error = "No tienes permisos. Solo puedes realizar esta operación si no eres admin.";
    return res.render('error', { error });
}

funciones.insertarLog = async (usuario, accion, observacion) => {
    const log = {
        usuario,
        accion,
        observacion
    }
    try {
        console.log("Insertando log: " + stringify(log));
        const a = await db.query("insert into logs SET ?", [log]);
        return a;
    } catch (err) {
        console.log(err);
        return "error";
    }

}

funciones.dumpearSQL = () => {
    // dump the result straight to a file
    console.log("===============================");
    console.log(db.config.connectionConfig);

    mysqldump({
        connection: {
            host: db.config.connectionConfig.host,
            user: db.config.connectionConfig.user,
            password: db.config.connectionConfig.password,
            database: db.config.connectionConfig.database,
        },
        dumpToFile: './src/public/dumpSQL/dumpSAN' + Date.now() + '.sql',
    });
}

funciones.verifyActiveGame = async (id_partida) => {
    try {
        const partida = await db.query(queries.queryPartidas + " where id= ?", [id_partida]);
        const date = Date.now();
        console.log(partida);
        if (partida.fecha_fin > date && partida.fecha_inicio < date)
            return "true";
    } catch (e) {
        console.log(e);
        return res.render('/error', { error: 'Actualmente no esta en juego dicha partida' });
    }
    return false;
}

funciones.S5 = async () => {
    //e ha tenido que añadir la condicion de que empiece por una letra para guardar objetos que llevan el id.
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return characters.charAt(Math.floor(Math.random() * characters.length)) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    //const guid = () => (S5()).toUpperCase();


}

funciones.getCode = () => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; //abcdefghijklmnopqrstuvwxyz
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 6) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export default funciones;