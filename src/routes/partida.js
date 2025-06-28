import { Router } from 'express';
import passport from 'passport';
const router = Router();
import { createTransport } from 'nodemailer';
import funciones from '../lib/funciones.js';
import db from "../database.js"; //db hace referencia a la BBDD
import queries from './queries.js';

// Middleware to check partida end conditions
const checkPartidaStatus = async (req, res, next) => {
  try {
    // Get all active partidas
    const activePartidas = await db.query(
      "SELECT * FROM partidas WHERE status IN ('enjuego', 'enpausa')"
    );

    for (const partida of activePartidas) {
      // Check if partida has ended due to time
      if (new Date(partida.fecha_fin) < new Date()) {
        await db.query(
          "UPDATE partidas SET status='finalizada' WHERE id=?",
          [partida.id]
        );
      }
    }
    next();
  } catch (error) {
    console.error('Error checking partida status:', error);
    next();
  }
};

// Apply the middleware to all partida routes
router.use(checkPartidaStatus);

//GESTION DEL CRUD
//CREATE
router.get("/add", funciones.isAuthenticated, async (req, res) => {
  res.render("partidas/add", {});
});
router.post("/add", funciones.isAuthenticated, async (req, res) => {
  const {
    titulo, descripcion, fecha_inicio, fecha_fin,
  } = req.body;
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var id = characters.charAt(Math.floor(Math.random() * characters.length)) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1).toUpperCase();
  console.log(id);
  try {
    const item = { id, titulo, descripcion, fecha_inicio, fecha_fin, 'status': 'encreacion', 'id_creador': req.user.id };
    console.log(item);
    //console.log(nanoid(6));
    await db.query("INSERT INTO partidas set ?", [item]);
    req.flash("success", "Partida insertado correctamente comparte el codigo: " + item.id);
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
  res.render("objetos/add_object", { id_partida });
});

router.get("/:id_partida/add_existing_object", funciones.hasPermission, async (req, res) => {
  const { id_partida } = req.params;

  try {
    const objetos = await db.query("Select * from objetos");
    console.log(objetos);
    res.render("objetos/add_existingObject", { objetos, id_partida });
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }

});

router.post("/:id_partida/add_existing_object", funciones.hasPermission, async (req, res) => {
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
        req.flash("error", "Hubo algun error");
        res.redirect("/error");
    }
});

router.get("/:id_partida/edit_object/:id_object", funciones.hasPermission, async (req, res) => {
  const { id_partida, id_object } = req.params;
  const objeto = (await db.query("select * from objetos WHERE id=? and id_partida=?", [id_object, id_partida]))[0];
  res.render("objetos/edit_object", { objeto, id_partida });
});
// para ver un OBJETO
router.get("/:id_partida/ver_object/:id_object", funciones.isAuthenticated, async (req, res) => {
  const { id_partida, id_object } = req.params;
  const objeto = (await db.query("select * from objetos WHERE id=? and id_partida=?", [id_object, id_partida]))[0];
  res.render("objetos/ver_object", { objeto, id_partida });
});

router.get("/plantillaindividual/:id_partida", funciones.isAuthenticated, funciones.hasPermission, async (req, res) => {
  const { id_partida } = req.params;
  id_jugador = req.user.id;
  //const partida = await db.query(queries.queryPartidasActivas + " WHERE pej.id_partida=? AND pej.eliminado>=1", [id_partida,]);
  const partida = await db.query(queries.queryPartidasActivas + " WHERE pej.id_partida=? ORDER BY pej.asesinatos desc", [id_partida,]);
  console.log(partida);
  //console.log(partida[0]);
  res.render("partidas/plantillaindividual", { partida, partidita: partida[0], });
});

//Para mostrar listado de partidas en las que esta incluido el jugador tanto si participa como si la ha creado (Un usuario al crear partida no se incluye por defecto como jugador)
router.get('/listar', funciones.isAuthenticated, async (req, res) => {
  try {
    const id_jugador = req.user.id;
    
    // Get partidas where user is a player but not the creator
    const partidasDondeParticipo = await db.query(
      queries.queryPartidasJugador + 
      " WHERE j.id_jugador=? AND NOT p.id_creador=? ORDER BY status",
      [id_jugador, id_jugador]
    );
    
    // Get partidas created by the user
    const partidas = await db.query(
      queries.queryPartidasPropias + 
      " WHERE p.id_creador=? ORDER BY status",
      [id_jugador]
    );

    // Log the retrieved partidas for debugging
    console.log(`Found ${partidas.length} partidas created by user ${id_jugador}`);
    console.log(`Found ${partidasDondeParticipo.length} partidas where user ${id_jugador} is a player`);

    // Render the view with both sets of partidas
    res.render('partidas/listar', {
      partidas,
      partidasDondeParticipo,
      user: req.user
    });

  } catch (error) {
    console.error(`Error listing partidas for user ${req.user.id}:`, error);
    
    // Provide more specific error messages based on error type
    switch (error.code) {
      case 'ER_BAD_NULL_ERROR':
        req.flash('error', 'Error de base de datos: datos nulos');
        break;
      case 'ER_TABLEACCESS_DENIED_ERROR':
        req.flash('error', 'Error de permisos en la base de datos');
        break;
      default:
        req.flash('error', 'Error al cargar las partidas');
    }
    
    res.redirect('/error');
  }
});

////Para mostrar listado de partidas en las que esta incluido el jugador tanto si participa como si la ha creado (Un usuario al crear partida no se incluye por defecto como jugador)
router.get('/listartodas', funciones.isAdmin, async (req, res) => {
  try {
    const partidasDondeParticipo = await db.query(queries.queryPartidasPropias + "  order by status", []);
    res.render('partidas/listar', { partidasDondeParticipo });
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});

//CARGA LA PANTALLA PRINCIPAL DE UNA PARTIDA
router.get("/plantilla/:id_partida", funciones.isAuthenticated, async (req, res) => {
  const { id_partida } = req.params;
  const id_jugador = req.user.id;
  try {
    let ganador = false;
    let hemuerto = false;
    let ticketenviado = false;

    // Traer partida y eliminaciones
    const partida = await db.query(
      queries.queryPartidasActivas + " WHERE pej.id_partida=? ORDER BY ua.usuario",
      [id_partida]
    );

    if (partida.length === 0) {
      req.flash("error", "No se encontró la partida.");
      return res.redirect("/error");
    }

    const eliminaciones = await db.query(
      queries.queryEliminaciones + " WHERE e.id_partida=? ORDER BY ua.usuario",
      [id_partida]
    );

    // ¿Es creador?
    const esCreador = partida[0].id_creador === id_jugador;

    // Listado de jugadores
    const jugadores = partida
      .map(el => ({
        id: el.id_jugador,
        usuario: el.jugador_user,
        full_name: el.jugador_name,
        eliminado: el.eliminado
      }))
      .sort((a, b) => a.usuario.localeCompare(b.usuario, "es"));

    // Listado de objetos
    const objetos = partida
      .map(el => ({
        id: el.id_objeto,
        nombre: el.objeto,
        descripcion: el.descripcion_objeto,
        eliminado: el.eliminado
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

    // Objetivo personal
    const objetivo = partida.find(el => el.id_jugador === id_jugador);

    // Última eliminación
    const lastKillQuery = await db.query(
      queries.queryEliminaciones + " WHERE e.id_partida=? ORDER BY e.fecha_eliminacion DESC LIMIT 1",
      [id_partida]
    );
    const last_kill = lastKillQuery[0];

    // Top killers
    const top_killers = partida
      .filter(el => el.asesinatos > 0)
      .sort((a, b) => b.asesinatos - a.asesinatos);

    // Si estoy jugando, comprobar si he muerto o enviado ticket
    let dididie = null;
    if (objetivo) {
      const muerteQuery = await db.query(
        queries.queryEliminaciones + " WHERE e.id_partida=? AND e.id_victima=?",
        [id_partida, id_jugador]
      );
      if (muerteQuery.length > 0) {
        hemuerto = true;
        dididie = muerteQuery[0];
      }

      const ticketQuery = await db.query(
        queries.queryPartidasEnJuego + " WHERE id_partida=? AND id_jugador=? AND id_victima=?",
        [id_partida, id_jugador, objetivo.id_victima]
      );
      if (ticketQuery[0]?.ticket) {
        ticketenviado = true;
      }
    }

    // Ticket recibido
    const ticket = partida.find(el => el.ticket === 1 && el.id_victima === id_jugador);

    // Supervivientes
    const supervivientes = partida.filter(el => el.eliminado === 0);

    if (supervivientes.length === 1) {
      // Solo actualizar si no está finalizada
      await db.query(
        "UPDATE partidas SET status='finalizada' WHERE id=? AND status!='finalizada'",
        [id_partida]
      );
      if (supervivientes[0].id_jugador === id_jugador) {
        ganador = true;
      }
    }

    res.render("partidas/plantilla", {
      partida,
      jugadores,
      objetos,
      ticket,
      objetivo,
      top_killers,
      last_kill,
      dididie,
      hemuerto,
      supervivientes,
      ganador,
      ticketenviado,
      esCreador
    });
  } catch (error) {
    console.error(">Un error:",error);
    req.flash("error", "Hubo algún error");
    res.redirect("/error");
  }
});
//JOIN PARA unirse a una partida
router.get("/join", funciones.isAuthenticated, async (req, res) => {
  res.render("partidas/join");
});
router.post("/join", funciones.isAuthenticated, async (req, res) => {
  const { id_partida } = req.body;
  //console.log(id_partida + " " + req.user.id);
  const item = { id_partida, id_jugador: req.user.id };

  try {
    await db.query("INSERT INTO jugadores set ?", [item]);
    req.flash("success", "Se ha unido a la partida satisfactoriamente");
    res.redirect("/partidas/edit/" + id_partida); //te redirige una vez insertado el item
    //res.redirect("/partidas/listar");

  } catch (error) {
    console.error(error.code);
    switch (error.code) {
      case "ER_DUP_ENTRY":
        console.log("Error ya estas agregado");
        req.flash("error", "El jugador ya esta agregado.");
        break;
      case "ER_BAD_NULL_ERROR":
        req.flash("error", "Hay un campo que es obligatorio");
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


//UPDATE
router.get("/edit/:id_partida", funciones.isAuthenticated, async (req, res) => {
  const { id_partida } = req.params;
  console.log(id_partida);
  var esCreador = false;
  try {
    const datospartida = (await db.query(queries.queryPartidas + " WHERE p.id=?", [id_partida,]))[0];
    const objetos = await db.query("select * from objetos WHERE id_partida=?", [id_partida,]);
    const jugadores = await db.query(queries.queryJugadores + " WHERE id_partida=?", [id_partida,]);
    const partida = await db.query(queries.queryPartidasActivas + " WHERE pej.id_partida=?", [id_partida,]);
    console.log(datospartida);

    //console.log(datospartida.id_creador + " " + req.user.id);
    //console.log(datospartida.id_creador == req.user.id);
    if (datospartida.id_creador == req.user.id) {
      esCreador = true;
      console.log(esCreador);
    }
    res.render("partidas/edit", { datospartida, objetos, jugadores, partida, esCreador });
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});
router.get("/editgame/:id_partida", funciones.hasPermission, async (req, res) => {

  const { id_partida } = req.params;
  console.log(id_partida);

  //console.log(req.params);
  //console.log(req.body);
  try {
    let partida = (await db.query(queries.queryPartidas + " WHERE p.id=?", [id_partida]))[0];
    console.log(partida);

    var date = partida.fecha_inicio;
    partida.fecha_inicio = date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, '0') + "-" + date.getDate() + "T" + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0');
    date = partida.fecha_fin;
    partida.fecha_fin = date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, '0') + "-" + date.getDate() + "T" + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0');
    console.log(partida.fecha_fin);
    res.render("partidas/edit_game", { partida, });
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});
router.post("/editgame/:id_partida", funciones.hasPermission, async (req, res) => {
  const {
    titulo, descripcion, fecha_inicio, fecha_fin, status
  } = req.body;
  const id = req.params.id_partida;
  console.log("id" + id);
  try {
    const item = { id, titulo, descripcion, fecha_inicio, fecha_fin, status };
    console.log(item);

    await db.query("UPDATE partidas set ? where id=?", [item, item.id]);
    req.flash("success", "Partida editada correctamenta");
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
router.get("/start/:id_partida", funciones.hasPermission, async (req, res) => {
  const { id_partida } = req.params;
  try {

    //reordeno/barajo objetos
    let objetos = await db.query(queries.queryObjetos + " WHERE id_partida=?", [id_partida,]);
    objetos = objetos.sort((a, b) => 0.5 - Math.random());
    //reordeno/barajo jugadores
    let jugadores = await db.query(queries.queryJugadores + " WHERE j.id_partida=?", [id_partida,]);
    jugadores = jugadores.sort((a, b) => 0.5 - Math.random());
    //console.log(objetos);
    //console.log(jugadores);

    let items = [];
    for (var i = 0; i < jugadores.length; i++) {
      if (i + 1 == jugadores.length)//el ultimo jugador le asignas de victima el primero
        items.push([id_partida, jugadores[i].id_jugador, jugadores[0].id_jugador, objetos[i].id]);
      else  // a los demas le asignas de victima el siguiente jugador en el array
        items.push([id_partida, jugadores[i].id_jugador, jugadores[i + 1].id_jugador, objetos[i].id]);
    }
    console.log(items);
    await db.query("insert into partidasenjuego (id_partida,id_jugador,id_victima,id_objeto) values ?", [items])
    const partida = await db.query("UPDATE partidas set status = 'enjuego' WHERE id=?", [id_partida,]);
    req.flash("succes", "Partida lanzada con exito");
    res.redirect("/partidas/plantilla/" + id_partida);
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

//Ruta para NOTIFICAR la solicitud de un asesinato.
router.get("/:id_partida/asesinar/:id_victima", funciones.isAuthenticated, async (req, res) => {
  const { id_victima, id_partida } = req.params;
  /* TODO: verificar que esta en tiempo */
  // funciones.verifyActiveGame(id_partida).then(check=>console.log(check));
  console.log("aviso enviado");
  //TODO: SE ALMACENAR EL TICKET EN LA FILA DONDE ID_JUGADOR (ID_ASESINO) Y ID_VICTIMA ES LA VICTIMA. Ahora mismo pienso que seria mejor almacenar el ticket en la fila de la ID_VICTIMA.

  try {
    await db.query("update partidasenjuego set ticket = true where id_partida=? AND id_jugador=? AND id_victima=?", [id_partida, req.user.id, id_victima])
    req.flash("success", "Aviso de asesinato enviado");
    res.redirect("/partidas/plantilla/" + id_partida);
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});
//Ruta para BORRAR NOTIFICACION la solicitud e un asesinato.
router.get("/:id_partida/borrarasesinar/:id_victima", funciones.isAuthenticated, async (req, res) => {
  const { id_victima, id_partida } = req.params;
  /* TODO: verificar que esta en tiempo */
  // funciones.verifyActiveGame(id_partida).then(check=>console.log(check));
  console.log("aviso enviado");
  //TODO: SE ALMACENAR EL TICKET EN LA FILA DONDE ID_JUGADOR (ID_ASESINO) Y ID_VICTIMA ES LA VICTIMA. Ahora mismo pienso que seria mejor almacenar el ticket en la fila de la ID_VICTIMA.

  try {
    await db.query("update partidasenjuego set ticket = false where id_partida=? AND id_jugador=? AND id_victima=?", [id_partida, req.user.id, id_victima])
    req.flash("success", "Aviso de asesinato borrado");
    res.redirect("/partidas/plantilla/" + id_partida);
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});

//Ruta para CONFIRMAR la solicitud de un asesinato. ES UNA MUERTE. JUGADOR ES QUIEN MUERE!!! ES DECIR VICTIMA.
router.get("/:id_partida/muerte", funciones.isAuthenticated, async (req, res) => {
  const { id_partida } = req.params;
  var id_jugador = req.user.id;
  try {

    let partida = (await db.query("select * from partidas WHERE  id_partida=?", [id_partida]))[0];
    if (partida.status != 'enjuego') {
      req.flash("error", "La partida no está en juego");
      res.redirect("/partidas/plantilla/" + id_partida);
    }
    if (partida.fecha_fin < new Date()) {
      req.flash("error", "La partida ha terminado");
      res.redirect("/partidas/plantilla/" + id_partida);
    }
    //otro jugador asesino envió ticket a victima, se almacena en ticket del asesino. EN LA TABLA PARTIDASENJUEGO.
    //GUARDO DATOS DEL ASESINO DEL JUGADOR Guarda en id_jugador al ASESINO y en id_victima a JUGADOR
    let asesino = (await db.query("select * from partidasenjuego WHERE id_victima=? and id_partida=?", [id_jugador, id_partida]))[0];
    console.log("1")
    console.log(asesino.ticket);
    //Guarda DATOS DE PARTIDA DEL ASESINO. En id_jugador al JUGADOR y en id_victima a la futura VICTIMA QUE HEREDARÁ el asesino.
    let jugador = (await db.query("select * from partidasenjuego WHERE id_jugador=? and id_partida=?", [id_jugador, id_partida]))[0];
    //console.log("2")
    //console.log(victima);
    console.log("3");

    //Creo el asesinato
    const eliminacion = {
      id_partida,
      'id_asesino': asesino.id_jugador,
      'id_victima': id_jugador,
      'id_objeto': asesino.id_objeto,
    }
    //Inserto la muerte en la tabla eliminaciones
    await db.query("INSERT INTO eliminaciones set ?", [eliminacion]);

    //ACTUALIZO VICTIMA=JUGADOR
    // Marco la victima muerta y su fecha.quito el ticket
    jugador.eliminado = true;
    jugador.fecha_asesinato = new Date();
    jugador.ticket = false;

    // Check if this elimination results in only one player remaining
    const remainingPlayers = await db.query(
      "SELECT COUNT(*) as remaining FROM partidasenjuego WHERE id_partida=? AND eliminado=0",
      [id_partida]
    );

    if (remainingPlayers[0].remaining === 1) {
      // Update partida status to finalizada
      await db.query(
        "UPDATE partidas SET status='finalizada' WHERE id=?",
        [id_partida]
      );
      // Get the winner
      const winner = await db.query(
        "SELECT id_jugador FROM partidasenjuego WHERE id_partida=? AND eliminado=0",
        [id_partida]
      );
      if (winner[0]?.id_jugador === id_jugador) {
        // Current player is the winner
        req.flash("success", "¡Enhorabuena! Has ganado la partida");
      } else {
        // Someone else is the winner
        const winnerName = await db.query(
          "SELECT jugador_user FROM usuarios WHERE id=?",
          [winner[0].id_jugador]
        );
        req.flash("info", `La partida ha terminado. El ganador es ${winnerName[0]?.jugador_user}`);
      }
    }


    //guardo datos a machacar del asesino
    let objetoaux = asesino.id_objeto;

    //ASESINO
    //Asigno nuevos datos del asesino que hereda del jugador asesinado, VICTIMA
    asesino.id_victima = jugador.id_victima;
    asesino.id_objeto = jugador.id_objeto;
    asesino.ticket = false;
    //Sumo muerte Actualizo nuevo objetivo
    asesino.asesinatos++;

    //recupero datos machacados del asesino a la victima. DATOS CON LOS QUE SE MATO. UN MUERTO TENDRA EN ID_VICTIMA A SU ASESINO ASI COMO EL OBJETO CON EL QUE LE MATARON
    jugador.id_victima = asesino.id_jugador;
    jugador.id_objeto = objetoaux;
    jugador.eliminado = 1;


    //await db.query("update partidasenjuego set ticket = true where id_partida=? AND id_jugador=? AND id_victima=?", [id_partida, req.user.id, id_victima])

    console.log("4")
    await db.query("UPDATE partidasenjuego set ? WHERE id_partida=? AND id_jugador=?", [jugador, id_partida, jugador.id_jugador,]);

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
    req.flash("error", "Hubo algun error: " + error.code);
    res.redirect("/error");
  }
});
//Ruta para RECHAZAR la solicitud de un asesinato.
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

//EDIT OBJETOS
router.get("/editObjects/:id_partida", funciones.isAuthenticated, async (req, res) => {
  const { id_partida } = req.params;
  console.log(id_partida);
  var esCreador = false;
  try {
    const datospartida = (await db.query(queries.queryPartidas + " WHERE p.id=?", [id_partida,]))[0];
    const objetos = await db.query("select * from objetos WHERE id_partida=?", [id_partida,]);

    if (datospartida.id_creador == req.user.id) {
      esCreador = true;
      console.log(esCreador);
    }
    console.log(datospartida);
    res.render("partidas/edit_objects", { datospartida, objetos, esCreador });
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
    var q = await db.query("SELECT * from partidas where id=?", [id_partida,]);
    if (q.status == 'encreacion') {
      await db.query("DELETE FROM jugadores WHERE id_jugador=? AND id_partida=?", [id_jugador, id_partida]);
      req.flash("success", "Jugador quitado de la lista correctamente");
      console.log("=>" + id_partida);
      res.redirect("/partidas/edit/" + id_partida);

    } else {
      req.flash("error", "Solo se pueden eliminar jugadores durante la creación de la partida");
      res.redirect("/partidas/plantilla/" + id_partida);
    }
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error");
    res.redirect("/error");
  }
});
router.get("/:id_partida/deleteobject/:id_objecto", funciones.hasPermission, async (req, res) => {
  const { id_objecto, id_partida } = req.params;
  console.log("objeto",id_objecto);
  console.log("partida",id_partida);
  try {
    var [q] = await db.query("SELECT * from partidas where id=?", [id_partida,]);
    console.log(q.status);
    if (q.status == 'encreacion') {
      await db.query("DELETE FROM objetos WHERE id=?", [id_objecto]);
      req.flash("success", "Objeto quitado de la lista correctamente");
      console.log("borrado objeto");
      res.redirect("/partidas/edit/" + id_partida);
    } else {
      req.flash("error", "Solo se pueden eliminar jugadores durante la creación de la partida");
      res.redirect("/partidas/edit/" + id_partida);
    }
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error:"+error);
    res.redirect("/error");
  }
});
router.get("/delete/:id_partida", funciones.hasPermission, async (req, res) => {
  const { id_partida } = req.params;
  console.log("BORRANDO PARTIDA...");
  try {
    let a = await db.query("DELETE FROM partidasenjuego WHERE id_partida=?", [id_partida]);
    let d = await db.query("DELETE FROM eliminaciones WHERE id_partida=?", [id_partida]);
    let b = await db.query("DELETE FROM objetos WHERE id_partida=?", [id_partida]);
    let c = await db.query("DELETE FROM jugadores WHERE id_partida=?", [id_partida]);
    let e = await db.query("DELETE FROM partidas WHERE id=?", [id_partida]);
    req.flash("success", "Partida borrada correctamente");
    res.redirect("/partidas/listar");
  } catch (error) {
    console.error(error.code);
    req.flash("error", "Hubo algun error: " + error.code);
    res.redirect("/error");
  }
});

export default router;
