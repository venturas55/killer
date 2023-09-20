const express = require("express");
const router = express.Router();
const { unlink } = require('fs-extra');
const path = require('path');
const queryUsuarios = "select * from usuarios";
const queryJugadores = "select j.id_partida,j.id_jugador,u.usuario,u.full_name,u.pictureURL FROM jugadores j LEFT JOIN usuarios u ON j.id_jugador=u.id ";

const funciones = require("../lib/funciones");

const db = require("../database"); //db hace referencia a la BBDD

//GESTION DEL CRUD
//CREATE
router.get("/add", funciones.isAdmin, async (req, res) => {
  const usuarios = await db.query(queryUsuarios);
  res.render("jugadores/add", { usuarios });
});
router.post("/add", funciones.isAdmin, async (req, res) => {
  const {
    jugador,
  } = req.body;
  console.log(jugador);
  const item = { id_partida: 1, id_jugador: jugador };
  try {
    await db.query("INSERT INTO jugadores set ?", [item]);
    req.flash("success", "Jugador insertado correctamente");
    res.redirect("/jugadores/list"); //te redirige una vez insertado el item
  } catch (error) {
    console.error(error.code);
    switch (error.code) {
      case "ER_DUP_ENTRY":
        req.flash("error", "El jugador seleccionado ya esta agregado.");
        break;
      case "ER_BAD_NULL_ERROR":
        req.flash("error", "El campo NIF es obligatorio");
        break;
      case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
        req.flash("error", "Hay un campo con valor incorrecto");
        break;

      default:
        req.flash("error", "Hubo algun error al intentar añadir el jugador");
    }
    req.flash("error", "Hubo algun error");

    res.redirect("/jugadores/list");
  }

});
//READ
router.get("/list", funciones.isAdmin, async (req, res) => {
  const items = await db.query(queryJugadores,);
  console.log(items);
  res.render("jugadores/list", { items });
});

router.get("/plantilla/:columnaA", async (req, res) => {
  const { columnaA } = req.params;

  const item = await db.query('SELECT * FROM objetos where id=?', [columnaA]);

  var fotitos = funciones.listadoFotos(columnaA);
  console.log("==>" + fotitos);

  res.render("jugadores/plantilla", { layout: 'layoutPlantillaItem1', item: item[0], obs: observaciones, mant: mantenimiento, imagen: fotitos });
  // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});
//UPDATE
/* router.get("/edit/:columnaA", funciones.isAuthenticated, async (req, res) => {
  const { columnaA } = req.params;
  const item = await db.query("SELECT * FROM objetos WHERE id=?", [columnaA,]);
  //console.log(item[0]);
  res.render("jugadores/edit", { item: item[0] });
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
  await db.query("UPDATE jugadores set ? WHERE columnaA = ?", [newItem, columnaAviejo,]);
  req.flash("success", "Item1 modificado correctamente");
  res.redirect("/jugadores/plantilla/" + newItem.columnaA);
}); */
//DELETE
router.get("/delete/:id_jugador", funciones.isAuthenticated, async (req, res) => {
  console.log(req.params.id_jugador);
  const { id_jugador } = req.params;
  await db.query("DELETE FROM jugadores WHERE id_jugador=?", [id_jugador]);
  req.flash("success", "Jugador quitado de la lista correctamente");
  res.redirect("/jugadores/list");
});


module.exports = router;
