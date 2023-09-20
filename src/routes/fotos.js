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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { user } = req.body;
        const dir = path.join(__dirname, '../public/img/profiles/');
        return cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, (uuidv4()+ path.extname(file.originalname)).toLowerCase());
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
    //console.log(req.file);
    //console.log(req.params);
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
    funciones.insertarLog(req.user.usuario, "UPDATE fotografia perfil", "");
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
    funciones.insertarLog(req.user.usuario, "DELETE fotografia perfil", "");
    req.flash("success", "Imagen borrada correctamente");
    res.redirect('/profile');
});




module.exports = router;