const express = require("express");
const router = express.Router();
const queries = require("./queries");
const funciones = require("../lib/funciones");

const db = require("../database"); //db hace referencia a la BBDD


//RUTA PARA ENVIAR COMUNICADOS /partidas/enviarComunicado/
router.get("/list/:id_partida", funciones.esCreadorPartida, async (req, res) => {
    const id_partida = req.params.id_partida;
    try {
        //console.log(id_partida);
        const comunicados = await db.query("select * from comunicados where id_partida=?", [id_partida]);
        //console.log(comunicados);
        var partida = (await db.query("select * from partidas where id=?", [id_partida]))[0];
        res.render("comunicado/list", { comunicados, partida: partida });
    } catch (error) {
        console.error(error.code);
        req.flash("error", "Hubo algun error");
        res.redirect("/error");
    }
});
router.get("/add/:id_partida", funciones.isAuthenticated, async (req, res) => {
    console.log("YE");
    const id_partida = req.params;
    try {

        res.render("comunicado/add", id_partida);
    } catch (error) {
        console.error(error.code);
        req.flash("error", "Hubo algun error");
        res.redirect("/error");
    }
});
router.post("/add", funciones.esCreadorPartida, async (req, res) => {
    const { titulo, descripcion, id_partida } = req.body
    try {
        //await db.query("select * from jugadores where id_partida=?", [id_partida]);
        const comunicado = {
            id_partida,
            descripcion,
            titulo
        }
        console.log(comunicado);
        await db.query("insert into comunicados set ?", [comunicado])
        req.flash("success", "Comunicado enviado");
        res.redirect("/comunicados/list/" + id_partida);
    } catch (error) {
        console.error(error.code);
        console.error(error.code);
        req.flash("error", "Hubo algun error");
        res.redirect("/error");
    }
});
router.get("/edit/:id", funciones.isAuthenticated, async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {
        const comunicado = (await db.query("select * from comunicados where id=?", [id]))[0];
        res.render("comunicado/edit", { comunicado });
    } catch (error) {
        console.error(error.code);
        req.flash("error", "Hubo algun error");
        res.redirect("/error");
    }
});

router.post("/edit", funciones.isAuthenticated, async (req, res) => {
    const { id, titulo, descripcion, id_partida } = req.body;
    const newComunicado = {
        id,
        titulo,
        descripcion,
        id_partida
    }
    console.log(newComunicado);
    try {
        const partida = (await db.query("select * from comunicados where id=?", [id]))[0];
        const comunicado = (await db.query("update comunicados set ? where id=?", [newComunicado, id]))[0];
        req.flash("success", "Comunicado modificado con exito");
        res.redirect("/comunicados/list/"+partida.id_partida);
    } catch (error) {
        console.error(error.code);
        req.flash("error", "Hubo algun error");
        res.redirect("/error");
    }
});

router.post("/del", funciones.hasPermission, async (req, res) => {
    const { id ,id_partida} = req.body;

    try {
        const partida = (await db.query("select * from comunicados where id=?", [id]))[0];
        console.log(partida);
        const comunicado = (await db.query("delete from comunicados where id=?", [id]))[0];
        req.flash("success", "Comunicado borrado con exito");
        res.redirect("/comunicados/list/"+partida.id_partida);
    } catch (error) {
        console.error(error.code);
        req.flash("error", "Hubo algun error");
        res.redirect("/error");
    }
});

module.exports = router;