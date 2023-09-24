const express = require("express");
const router = express.Router();
const { unlink } = require('fs-extra');
const path = require('path');
const queries = require("./queries");

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
  const usuarios = await db.query(queries.queryUsuarios);
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
router.get("/list", funciones.isAuthenticated, async (req, res) => {
  const items = await db.query(queries.queryPartidas,);
  console.log(items);
  res.render("partidas/list", { items });
});

router.get('/inicio', async (req, res) => {
  id_jugador = req.user.id;
  const partidas = await db.query(queries.queryPartidasActivas + " where pej.id_jugador=?", [id_jugador]);
  console.log(partidas);
  res.render('inicio', { partidas });
});

router.get("/plantillaindividual/:id", funciones.isAuthenticated, async (req, res) => {
  const { id } = req.params;
  id_jugador = req.user.id;
  const partida = await db.query(queries.queryPartidasActivas + " WHERE pej.id_partida=?", [id,]);
  //console.log(partida);
  //console.log(partida[0]);
  res.render("partidas/plantillaindividual", { partida, partidita: partida[0], });
});

router.get("/plantilla/:id", funciones.isAuthenticated, async (req, res) => {
  const { id } = req.params;
  id_jugador = req.user.id;
  const partida = await db.query(queries.queryPartidasActivas + " WHERE pej.id_partida=?", [id,]);
  let tickets = []
  for (let i = 0; i < partida.length; i++) {
    if (partida[i].ticket == 1 && partida[i].id_victima == req.user.id) {
      tickets.push(partida[i]);
    }
  }
  // console.log(tickets);
  const top_killers = await db.query(queries.queryPartidasActivas + " where pej.id_partida=? order by asesinatos desc limit 3", [id,]);
  const last_kill = await db.query(queries.queryPartidasActivas + " where pej.id_partida=? order by fecha_asesinato desc limit 1", [id,]);
  console.log(last_kill);
  res.render("partidas/plantilla", { partida, ticket: tickets[0], top_killers, last_kill:last_kill[0] });
});


//UPDATE
router.get("/edit/:id", funciones.isAdmin, async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const datospartida = await db.query(queries.queryPartidas + " WHERE id=?", [id,]);
  const objetos = await db.query(queries.queryPartidaObjetos + " WHERE id_partida=?", [id,]);
  const jugadores = await db.query(queries.queryPartidaJugadores + " WHERE id_partida=?", [id,]);
  const partida = await db.query(queries.queryPartidasActivas + " WHERE pej.id_partida=?", [id,]);
  //TODO: poder editar objetos... Como gestionar eso con las bases de datos...
  console.log(partida);
  res.render("partidas/edit", { datospartida: datospartida[0], objetos, jugadores, partida });
});
router.post("/edit/:id", funciones.isAdmin, async (req, res) => {
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

router.get("/start/:id", funciones.isAdmin, async (req, res) => {
  const { id } = req.params;
  const objetos = await db.query(queries.queryPartidaObjetos + " WHERE po.id_partida=?", [id,]);
  const jugadores = await db.query(queries.queryPartidaJugadores + " WHERE pj.id_partida=?", [id,]);
  let items = [];
  for (var i = 0; i < jugadores.length; i++) {
    if (i + 1 == jugadores.length)
      items.push([parseInt(id), jugadores[i].id_jugador, jugadores[0].id_jugador, objetos[i].id_objeto]);
    else
      items.push([parseInt(id), jugadores[i].id_jugador, jugadores[i + 1].id_jugador, objetos[i].id_objeto]);
  }
  console.log(items);
  await db.query("insert into partidasenjuego (id_partida,id_jugador,id_victima,id_objeto) values ?", [items])
  const partida = await db.query("UPDATE partidas set activa = true WHERE id=?", [id,]);
  res.redirect("/partidas/edit/" + id);
});

router.get("/pause/:id", funciones.isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const partida = await db.query("UPDATE partidas set activa = false WHERE id=?", [id,]);
  res.redirect("/partidas/edit/" + id);
});

router.get("/:id_partida/asesinar/:id_victima", funciones.isAuthenticated, async (req, res) => {
  const { id_victima, id_partida } = req.params;
  console.log(id_partida + " " + req.user.id + " " + id_victima);
  //const objetos = await db.query(queries.queryObjetos + " WHERE id_partida=?", [id_victima,]);
  //const jugadores = await db.query(queries.queryJugadores + " WHERE id_partida=?", [id_victima,]);
  await db.query("update partidasenjuego set ticket = true where id_partida=? AND id_jugador=? AND id_victima=?", [id_partida, req.user.id, id_victima])
  // res.redirect("/profile");
});

router.get("/:id_partida/muerte/:id_victima", funciones.isAuthenticated, async (req, res) => {
  const { id_victima, id_partida } = req.params;
  let item = await db.query("select * from partidasenjuego WHERE id_victima=? and id_partida=?", [id_victima, id_partida]);
  item = item[0];
  console.log(item);
  item.victima_killed = true;
  item.ticket = false;
  item.asesinatos++;
  item.fecha_asesinato = new Date();
  console.log(item);
  console.log(id_partida + " " + id_victima + " " + item.id_jugador);
  await db.query("UPDATE partidasenjuego set ? WHERE id_partida=? AND id_victima=? AND id_jugador=?", [item, id_partida, id_victima, item.id_jugador]);
  res.redirect("/partidas/plantilla/" + id_victima);
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
