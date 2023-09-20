const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const db = require("../database");
const mysqldump = require('mysqldump');
const { promisify } = require('util');
const { stringify } = require('querystring');
const mysql = require('mysql');
var readline = require('readline');
const helpers = {};

function createdDate(file) {
    const { birthtime } = fs.statSync(file)
    return birthtime
}

helpers.listadoFotos = (req, res, next) => {
    const nif = req;
    var fotitos = [];
    var directorio = path.join(__dirname, "../public/img/imagenes", nif);
    fs.readdir(directorio, (err, files) => {
        if (files) {
            files.forEach(file => {
                fotitos.push(file);
            });
        }
    });
    return fotitos;
}

helpers.listadoBackups = (req, res, next) => {
    var documentos = [];
    var directorio = path.join(__dirname, "../public/dumpSQL");
    fs.readdir(directorio, (err, files) => {
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

helpers.encryptPass = async(password) => {
    const sal = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, sal);
    return password;
};

helpers.verifyPassword = async(password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (e) {
        console.log(e);
    }
}

helpers.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/signin');
}

helpers.isNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/profile');
}

helpers.isAdmin = (req, res, next) => {
    if(req.user && req.user.privilegio == "admin") {
        return next();
    }
    return res.render('noPermission');
}

helpers.isNotAdmin = (req, res, next) => {
    if (!req.user.privilegio == "admin") {
        return next();
    }
    return res.render('noPermission');
}

helpers.insertarLog = async(usuario, accion, observacion) => {
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

helpers.dumpearSQL = () => {
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

module.exports = helpers;