const express = require("express");
const router = express.Router();
const { unlink } = require('fs-extra');
const path = require('path');
const queryUsuarios = "select * from usuarios";
const queryPartidas = "select * from partidas";
const queryObjetos = "select * from partidaobjetos po LEFT JOIN objetos o ON po.id_objeto=o.id";
const queryJugadores = "select * from partidajugadores pj LEFT JOIN usuarios u ON pj.id_jugador=u.id";
const queryPartidasActivas = "select pej.id_partida,pej.id_jugador,pej.victima as id_victima, pej.id_objeto,pej.asesinatos,p.titulo,p.descripcion,p.fecha_inicio,p.fecha_fin,p.activa,uv.full_name as victima,uv.pictureURL as foto_victima, ua.full_name as jugador ,o.nombre as objeto,o.descripcion as descripcion_objeto from partidasenjuego pej LEFT JOIN partidas p ON pej.id_partida=p.id LEFT JOIN usuarios uv ON uv.id=pej.victima LEFT JOIN objetos o ON o.id=pej.id_objeto LEFT JOIN usuarios ua ON ua.id=pej.id_jugador";
//const queryJugadores = "select pa.id_partida,pa.id_jugador,pa.id_objeto,p.titulo,p.fecha_inicio,p.fecha_fin,u.full_name,u.pictureURL,o.nombre,o.descripcion,o.pictureURL FROM partidasALL pa LEFT JOIN usuarios u ON pa.id_jugador=u.id LEFT JOIN objetos o ON pa.id_objeto=o.id LEFT JOIN partidas p ON pa.id_partida=p.id";

const funciones = require("../lib/funciones");

const db = require("../database"); //db hace referencia a la BBDD

//GESTION DEL CRUD
//CREATE
router.get("/add", funciones.isAdmin, async (req, res) => {
  res.render("partidas/add", {});
});
router.post("/add", funciones.isAdmin, async (req, res) => {
  const {
    titulo, descripcion, fecha_inicio, fecha_fin,
  } = req.body;
  const item = { titulo, descripcion, fecha_inicio, fecha_fin };
  console.log(item);
  try {
    await db.query("INSERT INTO partidas set ?", [item]);
    req.flash("success", "Partida insertado correctamente");
    res.redirect("/partidas/list"); //te redirige una vez insertado el item
  } catch (error) {
    console.error(error.code);
    switch (error.code) {
      case "ER_BAD_NULL_ERROR":
        req.flash("error", "El campo  es obligatorio");
        break;
      case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
        req.flash("error", "Hay un campo con valor incorrecto");
        break;

      default:
        req.flash("error", "Hubo algun error al intentar añadir el jugador");
    }
    req.flash("error", "Hubo algun error");

    res.redirect("/partidas/list");
  }

});

router.get("/:id/add_player", funciones.isAdmin, async (req, res) => {
  const { id } = req.params;
  const usuarios = await db.query(queryUsuarios);
  res.render("partidas/add_player", { usuarios, id });
});
router.post("/:id/add_player", funciones.isAdmin, async (req, res) => {
  const {
    jugador,
  } = req.body;
  const { id } = req.params;
  const item = { id_partida: id, id_jugador: jugador };
  console.log(item);
  try {
    await db.query("INSERT INTO partidajugadores set ?", [item]);
    req.flash("success", "Jugador insertado correctamente");
    res.redirect("/partidas/edit/" + id); //te redirige una vez insertado el item
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

    res.redirect("/partidas/list");
  }

});

router.get("/:id_partida/add_object", funciones.isAuthenticated, (req, res) => {
  const { id_partida } = req.params;
  console.log(id_partida);
  res.render("partidas/add_object", { id_partida });
});
router.post("/:id_partida/add_object", funciones.isAuthenticated, async (req, res) => {
  const { id_partida } = req.params;
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
  const a = await db.query("INSERT INTO objetos set ?", [item_1]);
  console.log("=>");
  console.log(a);
  const item = { id_partida, id_objeto: a.insertId }
  await db.query("INSERT INTO partidaobjetos set ?", [item]);

  req.flash("success", "Objeto insertado correctamente");
  res.redirect("/partidas/edit/" + id_partida); //te redirige una vez insertado el item
});

//READ
router.get("/list", funciones.isAdmin, async (req, res) => {
  const items = await db.query(queryPartidas,);
  console.log(items);
  res.render("partidas/list", { items });
});
router.get("/plantillaindividual/:id", funciones.isAuthenticated, async (req, res) => {
  const { id } = req.params;
  id_jugador = req.user.id;
  const partida = await db.query(queryPartidasActivas + " WHERE pej.id_partida=?", [id,]);
  //console.log(partida);
  console.log("=>"+partida[0].titulo);
  res.render("partidas/plantillaindividual", { partida , partidita:partida[0] });
});


//UPDATE
router.get("/edit/:id", funciones.isAuthenticated, async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const partida = await db.query(queryPartidas + " WHERE id=?", [id,]);
  const objetos = await db.query(queryObjetos + " WHERE id_partida=?", [id,]);
  const jugadores = await db.query(queryJugadores + " WHERE id_partida=?", [id,]);
  console.log(partida);
  res.render("partidas/edit", { partida: partida[0], objetos, jugadores, id });
});
router.post("/edit/:id", funciones.isAuthenticated, async (req, res) => {
  const idviejo = req.params.id;
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
  await db.query("UPDATE partidas set ? WHERE columnaA = ?", [newItem, columnaAviejo,]);
  req.flash("success", "Item1 modificado correctamente");
  res.redirect("/partidas/plantilla/" + newItem.columnaA);
});

router.get("/start/:id", funciones.isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const partida = await db.query("UPDATE partidas set activa = true WHERE id=?", [id,]);
  const objetos = await db.query(queryObjetos + " WHERE id_partida=?", [id,]);
  const jugadores = await db.query(queryJugadores + " WHERE id_partida=?", [id,]);
  let items = [];
  for (var i = 0; i < jugadores.length; i++) {
    if (i + 1 == jugadores.length)
      items.push([parseInt(id), jugadores[i].id_jugador, jugadores[0].id_jugador, objetos[i].id_objeto]);
    else
      items.push([parseInt(id), jugadores[i].id_jugador, jugadores[i + 1].id_jugador, objetos[i].id_objeto]);
  }
  console.log(items);
  await db.query("insert into partidasenjuego (id_partida,id_jugador,victima,id_objeto) values ?", [items])
  res.redirect("/partidas/edit/" + id);
});

router.get("/pause/:id", funciones.isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const partida = await db.query("UPDATE partidas set activa = false WHERE id=?", [id,]);
  res.redirect("/partidas/edit/" + id);
});

//DELETE
router.get("/:id_partida/deleteplayer/:id_jugador", funciones.isAuthenticated, async (req, res) => {
  const { id_jugador, id_partida } = req.params;
  await db.query("DELETE FROM partidajugadores WHERE id_jugador=? AND id_partida=?", [id_jugador, id_partida]);
  req.flash("success", "Jugador quitado de la lista correctamente");
  console.log("=>" + id_partida);
  res.redirect("/partidas/edit/" + id_partida);
});

router.get("/:id_partida/deleteobject/:id_objecto", funciones.isAuthenticated, async (req, res) => {
  const { id_objecto, id_partida } = req.params;
  await db.query("DELETE FROM partidaobjetos WHERE id_objeto=? AND id_partida=?", [id_objecto, id_partida]);
  await db.query("DELETE FROM objetos WHERE id=?", [id_objecto]);
  req.flash("success", "Objeto quitado de la lista correctamente");
  console.log("=>" + id_partida);
  res.redirect("/partidas/edit/" + id_partida);
});


module.exports = router;
