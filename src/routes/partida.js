const express = require("express");
const router = express.Router();
const { unlink } = require('fs-extra');
const path = require('path');
const queries = require("./queries");

const funciones = require("../lib/funciones");

const db = require("../database"); //db hace referencia a la BBDD

//GESTION DEL CRUD
//CREATE
router.get("/add", funciones.isAuthenticated, async (req, res) => {
  res.render("partidas/add", {});
});
router.post("/add", funciones.isAuthenticated, async (req, res) => {
  const {
    titulo, descripcion, fecha_inicio, fecha_fin,
  } = req.body;
  try {
    const item = { titulo, descripcion, fecha_inicio, fecha_fin, 'id_creador':req.user.id };
    console.log(item);

    await db.query("INSERT INTO partidas set ?", [item]);
    req.flash("success", "Partida insertado correctamente");
    res.redirect("/partidas/listar"); //te redirige una vez insertado el item
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

    res.redirect("/partidas/listar");
  }

});

router.get("/:id_partida/add_player", funciones.hasPermission, async (req, res) => {
  const { id_partida } = req.params;
  try {
    const usuarios = await db.query("Select * from usuarios");
    res.render("partidas/add_player", { usuarios, id_partida });
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});
router.post("/:id_partida/add_player", funciones.hasPermission, async (req, res) => {
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
        req.flash("error", "El jugador ya esta agregado.");
        break;
      case "ER_BAD_NULL_ERROR":
        req.flash("error", "El campo NIF es obligatorio");
        break;
      case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
        req.flash("error", "Hay un campo con valor incorrecto");
        break;
/* 
      default:
        req.flash("error", "Hubo algun error al intentar añadir el jugador"); */
    }
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }

});

router.get("/:id_partida/add_object", funciones.hasPermission, (req, res) => {
  const { id_partida } = req.params;
  res.render("partidas/add_object", { id_partida });
});
/* SE MUEVE A fotos.js por subir tambien foto del objeto
 router.post("/:id_partida/add_object", funciones.hasPermission, async (req, res) => {
  const { id_partida } = req.params;
  try {
    const {
      nombre,
      descripcion,
      imagen,
    } = req.body;
    const item_1 = {
      nombre,
      descripcion,
      pictureURL: imagen,
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
}); */

//READ
//Para mostrar listado de partidas para el admin
router.get("/listarotras", funciones.isAuthenticated, async (req, res) => {
  try {
    const id_jugador = req.user.id;
    const partidas = await db.query(queries.queryPartidasDistinc+" where p.status='encreacion'  group by p.id",[id_jugador]);
    const aplica = await db.query(queries.queryJugadores+" where id_jugador=?",[id_jugador]);
    console.log(partidas);
    console.log(aplica);
    //TODO: comprobar si cada partida[i] se encuentra en alguna de las aplicadas. Meter la info en el array partidas
    

    res.render("partidas/listarotras", { partidas });
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});

router.get("/listedit", funciones.isAuthenticated, async (req, res) => {
  try {
    const partidas = await db.query(queries.queryPartidas,);
    console.log(partidas);
    res.render("partidas/listedit", { partidas });
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});

//Para mostrar listado de partidas en las que esta incluido el jugador
router.get('/listar', async (req, res) => {
  id_jugador = req.user.id;
  try {
    //const partidas = await db.query(queries.queryPartidasAjenas + " where pej.id_jugador!=?", [id_jugador]);
    const partidas = await db.query(queries.queryPartidasJugador+" where j.id_jugador=?",[id_jugador,]);
    console.log(partidas);
    res.render('partidas/listar', { partidas, });
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});


//Para mostrar listado de partidas en las que NO esta incluido el jugador
router.get('/inicio', async (req, res) => {
  id_jugador = req.user.id;
  try {
    const partidas = await db.query(queries.queryPartidasActivas + " where pej.id_jugador=?", [id_jugador]);
    console.log(partidas);
    res.render('inicio', { partidas, });
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});

router.get("/plantillaindividual/:id_partida", funciones.isAuthenticated, async (req, res) => {
  const { id_partida } = req.params;
  id_jugador = req.user.id;
  const partida = await db.query(queries.queryPartidasActivas + " WHERE pej.id_partida=?", [id_partida,]);
  //console.log(partida);
  //console.log(partida[0]);
  res.render("partidas/plantillaindividual", { partida, partidita: partida[0], });
});

router.get("/plantilla/:id_partida", funciones.isAuthenticated, async (req, res) => {
  const { id_partida } = req.params;
  try {
    let ganador = false;
    id_jugador = req.user.id;
    const partida = await db.query(queries.queryPartidasActivas + " WHERE pej.id_partida=? order by ua.usuario ", [id_partida,]);
    //console.log(partida);

    //=============Obtengo un listado de los JUGADORES ordenados alfabeticamente.=================
    const jugadores = partida.map(function (el) {
      return { 'id': el.id_jugador, 'usuario': el.jugador_user, 'full_name': el.jugador_name, 'eliminado': el.eliminado, }
    });
    jugadores.sort(function (a, b) {
      var textA = a.usuario.toUpperCase();
      var textB = b.usuario.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    //console.log(jugadores);

    //==============Obtengo un listado de los OBJETOS ordenados alfabeticamente.===========
    const objetos = partida.map(function (el) {
      return { 'id': el.id_objeto, 'nombre': el.objeto, 'descripcion': el.descripcion_objeto, 'eliminado': el.eliminado, }
    });
    objetos.sort(function (a, b) {
      var textA = a.nombre.toUpperCase();
      var textB = b.nombre.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    //console.log(objetos);

    //===== OBJETIVO =================
    const jugador = partida.filter(function (el) {
      return el.id_jugador === req.user.id
    })[0];


    //===== TICKET =================
    const ticket = partida.filter(function (el) {
      return el.ticket == 1 && el.id_victima == req.user.id
    })[0];


    //===== TOP KILLERS =================
    const top_killers = partida.filter(function (el) {
      return el.asesinatos > 0
    });
    top_killers.sort(function (a, b) {
      var dos = a.asesinatos;
      var uno = b.asesinatos;
      return (uno < dos) ? -1 : (uno > dos) ? 1 : 0;
    });

    //===== LAST KILL =================
    const last_kill = (await db.query(queries.queryEliminaciones + " WHERE e.id_partida=? order by e.fecha_eliminacion desc limit 1", [id_partida,]))[0];

    //============= DIE ========
    const dididie = (await db.query(queries.queryEliminaciones + " WHERE e.id_partida=? AND e.id_victima = ? order by e.fecha_eliminacion desc limit 1", [id_partida, jugador.id_jugador]))[0];

    //================ SUPERVIVIENTES ===============
    const supervivientes = partida.filter(function (el) {
      return el.eliminado == 0
    });

    //======== Es el propio jugador el ganador???? =====
    //console.log(supervivientes.length + " " + supervivientes[0].id_jugador + " " + req.user.id)
    if (supervivientes.length == 1 && supervivientes[0].id_jugador == req.user.id) {
      ganador = true;
    }
    //console.log(ganador);
    res.render("partidas/plantilla", { partida, jugadores, objetos, ticket, jugador, top_killers, last_kill, dididie, supervivientes, ganador });
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});


//UPDATE
router.get("/edit/:id_partida", funciones.isAuthenticated, async (req, res) => {
  const { id_partida } = req.params;
  //console.log(id);
  try {
    const datospartida = (await db.query("select * from partidas WHERE id=?", [id_partida,]))[0];
    const objetos = await db.query("select * from objetos WHERE id_partida=?", [id_partida,]);
    const jugadores = await db.query(queries.queryJugadores + " WHERE id_partida=?", [id_partida,]);
    const partida = await db.query(queries.queryPartidasActivas + " WHERE pej.id_partida=?", [id_partida,]);
    console.log(partida);
    console.log(objetos);
    console.log(jugadores);
    res.render("partidas/edit", { datospartida, objetos, jugadores, partida });
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});
router.get("/start/:id_partida", funciones.hasPermission, async (req, res) => {
  const { id_partida } = req.params;
  try {
    let objetos = await db.query(queries.queryObjetos + " WHERE id_partida=?", [id_partida,]);
    objetos = objetos.sort((a, b) => 0.5 - Math.random());
    let jugadores = await db.query(queries.queryJugadores + " WHERE j.id_partida=?", [id_partida,]);
    jugadores = jugadores.sort((a, b) => 0.5 - Math.random());
    let items = [];
    for (var i = 0; i < jugadores.length; i++) {
      if (i + 1 == jugadores.length)
        items.push([parseInt(id_partida), jugadores[i].id_jugador, jugadores[0].id_jugador, objetos[i].id]);
      else
        items.push([parseInt(id_partida), jugadores[i].id_jugador, jugadores[i + 1].id_jugador, objetos[i].id]);
    }
    console.log(items);
    await db.query("insert into partidasenjuego (id_partida,id_jugador,id_victima,id_objeto) values ?", [items])
    const partida = await db.query("UPDATE partidas set status = 'enjuego' WHERE id=?", [id_partida,]);
    req.flash("succes", "Partida lanzada con exito");
    res.redirect("/partidas/edit/" + id_partida);
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});
router.get("/pause/:id_partida", funciones.hasPermission, async (req, res) => {
  const { id_partida } = req.params;
  try {
    const partida = await db.query("UPDATE partidas set status = 'enpausa' WHERE id=?", [id_partida,]);
    res.redirect("/partidas/edit/" + id_partida);
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});
router.get("/:id_partida/asesinar/:id_victima", funciones.isAuthenticated, async (req, res) => {
  const { id_victima, id_partida } = req.params;
  try {
    await db.query("update partidasenjuego set ticket = true where id_partida=? AND id_jugador=? AND id_victima=?", [id_partida, req.user.id, id_victima])
    res.redirect("/partidas/plantilla/" + id_partida);
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});
router.get("/:id_partida/muerte/:id_victima", funciones.isAuthenticated, async (req, res) => {
  const { id_victima, id_partida } = req.params;
  try {

    let asesino = (await db.query("select * from partidasenjuego WHERE id_victima=? and id_partida=?", [id_victima, id_partida]))[0];
    let victima = (await db.query("select * from partidasenjuego WHERE id_jugador=? and id_partida=?", [asesino.id_victima, id_partida]))[0];
    //console.log(asesino);
    //console.log(victima);
    //Inserto la muerte en la tabla eliminaciones
    const eliminacion = {
      id_partida,
      'id_asesino': asesino.id_jugador,
      'id_victima': asesino.id_victima,
      'id_objeto': asesino.id_objeto,
    }
    await db.query("INSERT INTO eliminaciones set ?", [eliminacion]);

    // Marco la victima muerta y su fecha.
    victima.eliminado = true;
    victima.fecha_asesinato = new Date();


    //Sumo muerte. quito el ticket. Actualizo nuevo objetivo
    asesino.ticket = false;
    asesino.asesinatos++;
    //guardo datos a machacar del asesino
    let victimaaux = asesino.id_victima;
    let objetoaux = asesino.id_objeto;
    //machaco datos del asesino
    asesino.id_victima = victima.id_victima;
    asesino.id_objeto = victima.id_objeto;
    //recupero datos machacados del asesino a la victima. DATOS CON LOS QUE SE MATO
    victima.id_victima = victimaaux;
    victima.id_objeto = objetoaux;

    asesino.fecha_asesinato = new Date();
    //console.log(asesino);
    //console.log(id_partida + " " + id_victima + " " + asesino.id_jugador);
    await db.query("UPDATE partidasenjuego set ? WHERE id_partida=? AND id_jugador=?", [victima, id_partida, victima.id_jugador,]);
    await db.query("UPDATE partidasenjuego set ? WHERE id_partida=? AND id_jugador=?", [asesino, id_partida, asesino.id_jugador]);

    //VERIFICAR SI SE ACABA LA PARTIDA BASANDONOS EN SUPERVIVIENTES
    let supervivientes = await db.query("select * from partidasenjuego WHERE eliminado=false and id_partida=?", [id_partida]);
    //console.log(supervivientes);
    if (supervivientes.length == 1) {
      await db.query("UPDATE partidas set status='finalizada' WHERE id=?", [id_partida,]);
    }

    res.redirect("/partidas/plantilla/" + id_partida);
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});
router.get("/:id_partida/rejectkill/:id_victima", funciones.isAuthenticated, async (req, res) => {
  const { id_victima, id_partida } = req.params;
  try {
    await db.query("update partidasenjuego set ticket = false where id_partida=?  AND id_victima=?", [id_partida, id_victima])
    res.redirect("/partidas/plantilla/" + id_partida);
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});

//DELETE
router.get("/:id_partida/deleteplayer/:id_jugador", funciones.hasPermission, async (req, res) => {
  const { id_jugador, id_partida } = req.params;
  try {
    await db.query("DELETE FROM jugadores WHERE id_jugador=? AND id_partida=?", [id_jugador, id_partida]);
    req.flash("success", "Jugador quitado de la lista correctamente");
    console.log("=>" + id_partida);
    res.redirect("/partidas/edit/" + id_partida);
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});
router.get("/:id_partida/deleteobject/:id_objecto", funciones.hasPermission, async (req, res) => {
  const { id_objecto, id_partida } = req.params;
  try {
    await db.query("DELETE FROM objetos WHERE id=?", [id_objecto]);
    req.flash("success", "Objeto quitado de la lista correctamente");
    console.log("borrado objeto");
    res.redirect("/partidas/edit/" + id_partida);
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});
router.get("/delete/:id_partida", funciones.hasPermission, async (req, res) => {
  const { id_partida } = req.params;
  try {
    let a = await db.query("DELETE FROM partidasenjuego WHERE id_partida=?", [id_partida]);
    let b = await db.query("DELETE FROM objetos WHERE id_partida=?", [id_partida]);
    let c = await db.query("DELETE FROM jugadores WHERE id_partida=?", [id_partida]);
    let d = await db.query("DELETE FROM partidas WHERE id=?", [id_partida]);
    req.flash("success", "Partida borrada correctamente");
    res.redirect("/partidas/listar");
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});

module.exports = router;
