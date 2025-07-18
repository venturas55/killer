import { Router } from "express";
const router = Router();

import fse from 'fs-extra';
import fs from 'fs';
import path from 'path';
import db from "../database.js"; //db hace referencia a la BBDD
import multer from 'multer';
import { access, constants } from 'fs';
import funciones from "../lib/funciones.js";
import { v4 as uuidv4 } from 'uuid';
import { imageSizeLimitErrorHandler } from "../lib/validaciones.js";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

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
                await fse.unlink(filePath);
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
//ESTA VERSION DE LA RUTA ES PARA USAR LAS FOTOS VIVO MUERTO
// TODO: implementar que al subir una foto SE COPIE DIRECTAMENTE TAMBIEN EN LA TABLA DE VIVO Y EN LA DE MUERTO EN B/N
/* router.get("/jugador/foto/:id_jugador/:eliminado", async (req, res) => {
    let { id_jugador, eliminado } = req.params;
    const jugador = (await db.query(queries.queryJugadores + " WHERE id_jugador=?", [id_jugador,]))[0];
    eliminado == 1 ? eliminado = true : eliminado = false;
    console.log(eliminado);
    res.render("fotos/foto", { jugador, eliminado });
}); */

//PARA MOSTRAR LA FOTO DE UN JUGADOR VIVO O MUERTO
router.get("/jugador/foto/:id_partida/:id_jugador", async (req, res) => {
    let { id_jugador, id_partida } = req.params;
    var eliminado=false;
    var jugador = (await db.query("select * from usuarios u LEFT JOIN eliminaciones e ON e.id_victima=u.id where u.id=? and e.id_partida=?", [id_jugador,id_partida]))[0];
    jugador ? eliminado = true : jugador = (await db.query("select * from usuarios u Where u.id=?", [id_jugador,]))[0];
    res.render("fotos/foto", { jugador, eliminado });
});

//PARA VER UN USUARIO
router.get("/jugador/foto/:id_jugador", async (req, res) => {
    let { id_jugador } = req.params;
    var jugador = (await db.query("select * from usuarios u where u.id=?", [id_jugador,]))[0];

    res.render("fotos/fotoplayer", { jugador, });
});

router.get("/jugador/fotosjuego/", async (req, res) => {
    const jugador = (await db.query("select * from jugadores j LEFT JOIN usuarios u on u.id=j.id_jugador WHERE id_jugador=?", [req.user.id,]))[0];

    console.log(jugador);
    res.render("fotos/fotos", { jugador, });
});

router.get("/jugador/fotos/delete/:tipo", funciones.isAuthenticated, async (req, res) => {
    //console.log(req.params);
    const { tipo } = req.params;
    const  id  = req.user.id;
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

//Borrar un jugador de una partida
router.get("/jugador/:id_partida/deleteplayer/:id_jugador", funciones.hasPermission, async (req, res) => {
  const { id_jugador, id_partida } = req.params;
  try {
    var q = await db.query("SELECT * from partidas where id=?", [id_partida,]);
    if (q.status == 'encreacion') {
      await db.query("DELETE FROM jugadores WHERE id_jugador=? AND id_partida=?", [id_jugador, id_partida]);
      req.flash("success", "Jugador quitado de la lista correctamente");
      console.log("=>" + id_partida);
      res.redirect("/partidas/edit/" + id_partida);

    } else {
      req.flash("danger", "Solo se pueden eliminar jugadores durante la creación de la partida");
      res.redirect("/partidas/plantilla/" + id_partida);
    }
  } catch (error) {
    console.error(error.code);
    req.flash("danger", "Hubo algun error");
    res.redirect("/error");
  }
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

//Rutas para añadir jugador a una partida
router.get("/partidas/:id_partida/add_player", funciones.hasPermission, async (req, res) => {
  const { id_partida } = req.params;
  try {
    const usuarios = await db.query("Select * from usuarios");
    res.render("partidas/add_player", { usuarios, id_partida });
  } catch (error) {
    console.error(error.code);
    req.flash("danger", "Hubo algun error");
    res.redirect("/error");
  }
});
router.post("/partidas/:id_partida/add_player", funciones.hasPermission, async (req, res) => {
  const {
    jugador,
  } = req.body;
  const { id_partida } = req.params;
  const item = { id_partida, id_jugador: jugador };
  console.log(item);

  try {
    await db.query("INSERT INTO jugadores set ?", [item]);
    req.flash("success", "Jugador insertado correctamente");
    res.redirect("/partidas/edit/" + id_partida); //te redirige una vez insertado el item

  } catch (error) {
    console.error(error.code);
    switch (error.code) {
      case "ER_DUP_ENTRY":
        console.log("Error ya estas agregado");
        req.flash("danger", "El jugador ya esta agregado.");
        break;
      case "ER_BAD_NULL_ERROR":
        req.flash("danger", "El campo NIF es obligatorio");
        break;
      case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
        req.flash("danger", "Hay un campo con valor incorrecto");
        break;
      /* 
            default:
              req.flash("danger", "Hubo algun error al intentar añadir el jugador"); */
    }
    req.flash("danger", "Hubo algun error");
    res.redirect("/error");
  }

});

export default router;