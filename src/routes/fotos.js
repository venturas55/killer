const express = require("express");
const router = express.Router();
const { unlink } = require('fs-extra');
const fs = require('fs');
const path = require('path');
const db = require("../database"); //db hace referencia a la BBDD
const multer = require('multer');
//const { access, constants } = require('node:fs');
const { access, constants } = require('fs');
const funciones = require("../lib/funciones.js");
const { v4: uuidv4 } = require('uuid');
const queries = require("./queries");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { user } = req.body;
        console.log(user);
        if (typeof user === 'undefined') {
            const dir = path.join(__dirname, '../public/img/imagenes/');

            fs.exists(dir, exist => {
                if (!exist) {
                    return fs.mkdir(dir, error => cb(error, dir));
                }
                return cb(null, dir);
            })
        } else {//si no, entonces es una foto de perfil y va a otra carpeta
            const dir = path.join(__dirname, '../public/img/profiles/');
            console.log("dir" + dir);
            return cb(null, dir);
        }
    },
    filename: (req, file, cb) => {
        cb(null, (uuidv4() + path.extname(file.originalname)).toLowerCase());
    }
});

const uploadFoto = multer({
    storage,
    limits: { fileSize: 5000000, },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|bmp|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb(("Error: Archivo debe ser una imagen valida jpeg,jpg,png,bmp o gif"));
    }
}).single('imagen');

//GESTION  foto perfil
router.post('/profile/upload/:id', funciones.isAuthenticated, uploadFoto, async (req, res) => {
    const { id } = req.params;
    var usuario = await db.query("select * from usuarios where id = ?", id);
    usuario = usuario[0];
    //borramos la foto anterior del perfil
    if (usuario.pictureURL != "") {
        const filePath = path.resolve('src/public/img/profiles/' + usuario.pictureURL);
        access(filePath, constants.F_OK, async (err) => {
            if (err) {
                req.flash("warning", "No tiene foto de perfil!");
                console.log("No tiene foto de perfil");
            } else {
                console.log('File exists. Deleting now ...');
                await unlink(filePath);
            }
        });
    }

    //Ponemos la nueva
    usuario.pictureURL = req.file.filename;
    await db.query("UPDATE usuarios set  ? WHERE id=?", [usuario, id]);
    //funciones.insertarLog(req.user.usuario, "UPDATE fotografia perfil", "");
    req.flash("success", "Foto de perfil actualizada con exito");
    res.redirect("/profile");
});
router.get("/profile/borrarfoto/:id/:url", funciones.isAuthenticated, async (req, res) => {
    //console.log(req.params);
    const { url } = req.params;
    const { id } = req.params;
    await db.query("UPDATE usuarios set pictureURL = NULL WHERE id=?", [id]);
    const filePath = path.resolve('src/public/img/profiles/' + url);
    access(filePath, constants.F_OK, async (err) => {
        if (err) {
            console.log("No tiene foto de perfil");
        } else {
            console.log('File exists. Deleting now ...');
            await unlink(filePath);
        }
    });
    //funciones.insertarLog(req.user.usuario, "DELETE fotografia perfil", "");
    req.flash("success", "Imagen borrada correctamente");
    res.redirect('/profile');
});

//FOTOS DEL JUEGO KILLER, VIVO Y MUERTO
router.get("/jugador/foto/:id_jugador/:eliminado", async (req, res) => {
    let { id_jugador, eliminado } = req.params;
    const jugador = (await db.query(queries.queryJugadores + " WHERE id_jugador=?", [id_jugador,]))[0];
    eliminado == 1 ? eliminado = true : eliminado = false;
    console.log(eliminado);
    res.render("fotos/foto", { jugador, eliminado });
});

router.get("/jugador/fotosjuego/", async (req, res) => {
    const jugador = (await db.query("select * from jugadores j LEFT JOIN usuarios u on u.id=j.id_jugador WHERE id_jugador=?", [req.user.id,]))[0];

    console.log(jugador);
    res.render("fotos/fotos", { jugador, });
});

router.get("/jugador/foto/delete/:tipo", funciones.isAuthenticated, async (req, res) => {
    //console.log(req.params);
    const { tipo } = req.params;
    const { id } = req.user.id;
    let url;
    console.log(id);
    const jugador = (await db.query("select * from jugadores WHERE id_jugador=?", [req.user.id,]))[0];
    console.log(jugador);
    if (tipo == 'alive') {
        await db.query("UPDATE jugadores set imagenAlive = NULL WHERE id_jugador=?", [req.user.id]);
        url = jugador.imagenAlive;
    }
    else if (tipo == 'dead') {
        await db.query("UPDATE jugadores set imagenDead = NULL WHERE id_jugador=?", [id]);
        url = jugador.imagenDead;
    }

    const filePath = path.resolve('src/public/img/imagenes/' + url);
    access(filePath, constants.F_OK, async (err) => {
        if (err) {
            console.log("No tiene foto de perfil");
        } else {
            console.log('File exists. Deleting now ...');
            await unlink(filePath);
        }
    });
    req.flash("success", "Imagen borrada correctamente");
    res.redirect('/jugador/fotosjuego');
});

router.post('/jugador/upload', funciones.isAuthenticated, uploadFoto, async (req, res) => {
    const { tipo } = req.body;
    console.log(tipo);
    let url;
    var jugador = (await db.query("select * from jugadores where id_jugador = ?", req.user.id))[0];
    tipo == 'alive' ? url = jugador.imagenAlive : "";
    tipo == 'dead' ? url = jugador.imagenDead : "";
    //borramos la foto anterior del perfil
    if (url != "") {
        const filePath = path.resolve('src/public/img/imagenes/' + url);
        access(filePath, constants.F_OK, async (err) => {
            if (err) {
                req.flash("warning", "No tiene foto de juego!");
                console.log("No tiene foto de juego");
            } else {
                console.log('File exists. Deleting now ...');
                await unlink(filePath);
            }
        });
    }
    //Ponemos la nueva
    tipo == 'alive' ? jugador.imagenAlive = req.file.filename : jugador.imagenDead = req.file.filename;;
    await db.query("UPDATE jugadores set ? WHERE id_jugador=? and id_partida=?", [jugador, jugador.id_jugador, jugador.id_partida]);
    //funciones.insertarLog(req.user.usuario, "UPDATE fotografia juego", "");
    req.flash("success", "Foto de perfil actualizada con exito");
    res.redirect("/jugador/fotosjuego");
});

//FOTOS DEL OBJETO
router.post("/partidas/:id_partida/add_object", funciones.hasPermission, uploadFoto, async (req, res) => {
    const { id_partida } = req.params;
    const { nombre, descripcion } = req.body;
    var pictureURL = "";
    if (typeof req.file !== 'undefined')
        pictureURL = req.file.filename;
    try {
        const {
            nombre,
            descripcion,
        } = req.body;
        const item_1 = {
            nombre,
            descripcion,
            pictureURL,
            id_partida,
        };
        const a = await db.query("INSERT INTO objetos set ?", [item_1]);
        req.flash("success", "Objeto insertado correctamente");
        res.redirect("/partidas/edit/" + id_partida); //te redirige una vez insertado el item
    } catch (error) {
        console.error(error.code);
        req.flash("error", "Hubo algun error");
        res.redirect("/error");
    }
});

router.post("/partidas/:id_partida/edit_object/:id_object", funciones.hasPermission, uploadFoto, async (req, res) => {
    const { id_object, id_partida } = req.params;
    const { nombre, descripcion } = req.body;
    var pictureURL = "";
    if (typeof req.file !== 'undefined')
        pictureURL = req.file.filename;
    try {
        const objeto = (await db.query("select * from objetos WHERE id=? and id_partida=?", [id_object, id_partida]))[0];
        const item_1 = {
            nombre,
            descripcion,
            pictureURL,
            id_partida,
        };
        const a = await db.query("UPDATE objetos set ? where id=?", [item_1,id_object]);
        res.redirect("/partidas/edit/"+id_partida);
    } catch (error) {
        console.error(error.code);
        req.flash("error", "Hubo algun error");
        res.redirect("/error");
    }
});

router.get("/objeto/foto/:id_objeto", async (req, res) => {
    let { id_objeto } = req.params;
    const objeto = (await db.query(queries.queryObjetos + " WHERE id=?", [id_objeto,]))[0];

    res.render("fotos/fotoobjeto", { objeto, });
});

module.exports = router;