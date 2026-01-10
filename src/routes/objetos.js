import { Router } from "express";
const router = Router();

import fse from 'fs-extra';
import fs from 'fs';
import path from 'path';
import db from "../database.js"; //db hace referencia a la BBDD
import multer from 'multer';
import { access, constants } from 'fs';
import funciones from "../lib/funciones.js";
import queries from "./queries.js";
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
        req.flash("danger", "Hubo algun error");
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
        req.flash("danger", "Hubo algun error");
        res.redirect("/error");
    }
});

//Editar un objeto de una partida
router.get("/partidas/editObjects/:id_partida", funciones.isAuthenticated, async (req, res) => {
  const { id_partida } = req.params;
  console.log(id_partida);
  var esCreador = false;
  try {
    const datospartida = (await db.query(queries.queryPartidas + " WHERE p.id=?", [id_partida,]))[0];
    console.log("datospartida: ",datospartida);

    const objetos = await db.query("select * from objetos WHERE id_partida=?", [id_partida,]);

    if (datospartida.id_creador == req.user.id) {
      esCreador = true;
      console.log(esCreador);
    }
    res.render("partidas/edit_objects", { datospartida, objetos, esCreador });
  } catch (error) {
    console.error(error);
    req.flash("danger", "Hubo algun error",error);
    res.redirect("/error");
  }
});

//Borrar un objeto de una partida
router.get("/partidas/:id_partida/deleteobject/:id_objecto", funciones.hasPermission, async (req, res) => {
  console.log("borrando objeto...");
  const { id_objecto, id_partida } = req.params;
  console.log("id_objeto: ",id_objecto);
  console.log("id_partida: ",id_partida);
  try {
    var [q] = await db.query("SELECT * from partidas where id=?", [id_partida,]);
    console.log(q.status);
    if (q.status == 'encreacion') {
      await db.query("DELETE FROM objetos WHERE id=?", [id_objecto]);
      req.flash("success", "Objeto quitado de la lista correctamente");
      console.log("borrado objeto");
      res.redirect("/partidas/edit/" + id_partida);
    } else {
      req.flash("danger", "Solo se pueden eliminar jugadores durante la creación de la partida");
      res.redirect("/partidas/edit/" + id_partida);
    }
  } catch (error) {
    console.error(error.code);
    req.flash("danger", "Hubo algun error:",error);
    res.redirect("/error");
  }
});

router.get("/partidas/:id_partida/add_object", funciones.hasPermission, (req, res) => {
  const { id_partida } = req.params;
  res.render("objetos/add_object", { id_partida });
});

router.get("/partidas/:id_partida/add_existing_object", funciones.hasPermission, async (req, res) => {
  const { id_partida } = req.params;

  try {
    //const objetos = await db.query("Select * from objetos");
    const objetos = await db.query("SELECT o.* FROM objetos o INNER JOIN (   SELECT nombre, MIN(id) AS id   FROM objetos   GROUP BY nombre ) AS sub ON o.id = sub.id WHERE TRIM(o.descripcion) != '' OR TRIM(o.pictureURL) != ''");
    console.log(objetos);
    res.render("objetos/add_existingObject", { objetos, id_partida });
  } catch (error) {
    console.error(error.code);
    req.flash("danger", "Hubo algun error");
    res.redirect("/error");
  }

});

router.post("/partidas/:id_partida/add_existing_object", funciones.hasPermission, async (req, res) => {
    const { id_partida } = req.params;
    console.log(req.body );
    const { nombre, descripcion,pictureURL } = req.body;   
    try {
        const item_1 = {
            nombre,
            descripcion,
            pictureURL,
            id_partida,
        };
        console.log("item",item_1);
        const a = await db.query("INSERT INTO objetos set ?", [item_1]);
        req.flash("success", "Objeto insertado correctamente");
        res.redirect("/partidas/edit/" + id_partida); //te redirige una vez insertado el item
    } catch (error) {
        console.error(error.code);
        req.flash("danger", "Hubo algun error");
        res.redirect("/error");
    }
});

router.get("/partidas/:id_partida/edit_object/:id_object", funciones.hasPermission, async (req, res) => {
  const { id_partida, id_object } = req.params;
  const objeto = (await db.query("select * from objetos WHERE id=? and id_partida=?", [id_object, id_partida]))[0];
  res.render("objetos/edit_object", { objeto, id_partida });
});
// para ver un OBJETO
router.get("/partidas/:id_partida/ver_object/:id_object", funciones.isAuthenticated, async (req, res) => {
  const { id_partida, id_object } = req.params;
  const objeto = (await db.query("select * from objetos WHERE id=? and id_partida=?", [id_object, id_partida]))[0];
  res.render("objetos/ver_object", { objeto, id_partida });
});

export default router;