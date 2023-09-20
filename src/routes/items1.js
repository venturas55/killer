const express = require("express");
const router = express.Router();
const { unlink } = require('fs-extra');
const path = require('path');

const funciones = require("../lib/funciones");

const db = require("../database"); //db hace referencia a la BBDD
//SETTINGS
 //TODO: DONDE columnaF es numeral //TODO:

//GESTION DEL CRUD
//CREATE
router.get("/add", funciones.isAuthenticated, (req, res) => {
  res.render("objetos/add");
});
router.post("/add", funciones.isAuthenticated, async (req, res) => {
  const {
    nombre,
    descripcion,
    imagen,
  } = req.body;
  const item_1 = {
    nombre,
    descripcion,
    pictureURL: imagen

  };

  await db.query("INSERT INTO objetos set ?", [item_1]);

  req.flash("success", "Objeto insertado correctamente");
  res.redirect("/objetos/list"); //te redirige una vez insertado el item
});
//READ
router.get("/list", async (req, res) => {
  const items = await db.query("SELECT * FROM objetos",);
  res.render("objetos/list", { items });
});

router.get("/plantilla/:columnaA", async (req, res) => {
  const { columnaA } = req.params;

  const item = await db.query('SELECT * FROM objetos where id=?', [columnaA]);

  var fotitos = funciones.listadoFotos(columnaA);
  console.log("==>" + fotitos);

  res.render("objetos/plantilla", { layout: 'layoutPlantillaItem1', item: item[0], obs: observaciones, mant: mantenimiento, imagen: fotitos });
  // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});
//UPDATE
router.get("/edit/:columnaA", funciones.isAuthenticated, async (req, res) => {
  const { columnaA } = req.params;
  const item = await db.query("SELECT * FROM objetos WHERE id=?", [columnaA,]);
  //console.log(item[0]);
  res.render("objetos/edit", { item: item[0] });
});
router.post("/edit/:columnaA", funciones.isAuthenticated, async (req, res) => {
  const columnaAviejo = req.params.columnaA;
  var {
    columnaA,
    columnaB,
    columnaC,
    columnaD,
    columnaE,
    columnaF,
    columnaGnum,
  } = req.body;
  //TODO: PARSEAR LAS COLUMNAS QUE SEAN INT/FLOAT eg: columnaF = parseInt(columnaF);
  const newItem = {
    columnaA,
    columnaB,
    columnaC,
    columnaD,
    columnaE,
    columnaF,
    columnaGnum,
  };
  //console.log(newItem);
  console.log("req.params " + req.params.columnaA);
  await db.query("UPDATE objetos set ? WHERE columnaA = ?", [newItem, columnaAviejo,]);
  req.flash("success", "Item1 modificado correctamente");
  res.redirect("/objetos/plantilla/" + newItem.columnaA);
});
//DELETE
router.get("/delete/:columnaA", funciones.isAuthenticated, async (req, res) => {

  console.log(req.params.columnaA);
  const { columnaA } = req.params;
  await db.query("DELETE FROM objetos WHERE columnaA=?", [columnaA]);

  //TODO: faltaria borrar la carpeta con las fotos
  req.flash("success", "Item1 borrado correctamente");
  res.redirect("/objetos/list");
});

//GESTION DE FOTOS
router.get("/fotos/:columnaA", async (req, res) => {
  const columnaA = req.params.columnaA;
  var fotos = funciones.listadoFotos(columnaA);
  res.render("objetos/fotos", { fotos, columnaA });
});
router.get("/fotos/:columnaA/:src/delete", async (req, res) => {
  const columnaA = req.params.columnaA;
  const src = req.params.src;
  await unlink(path.resolve('src/public/img/imagenes/' + columnaA + "/" + src));
  req.flash("success", "Foto de baliza " + columnaA + " borrada correctamente.");
  res.redirect("/objetos/fotos/" + columnaA);
});
router.post("/upload/:columnaA", async (req, res) => {
  const { columnaA } = req.params;
  const { user } = req.body;
  console.log(req.params);
  console.log(req.body);
  if (typeof user === 'undefined') {
    req.flash("success", "Foto de la baliza " + columnaA + " subida correctamente!");
    res.redirect("/objetos/plantilla/" + columnaA);
  } else {
    //const oldUser = await pool.query("SELECT * FROM usuarios WHERE usuario=?", user);
    // var newUser=oldUser;
    //newUser.profilePicture = 
    // await db.query("UPDATE usuarios set ? WHERE usuario = ?", [ newUser,  oldUser, ]);
    req.flash("success", "La foto del perfil de usuario ha sido actualizada con exito");
    res.redirect("/profile");
  }

});


module.exports = router;
