const express= require('express');
const router = express.Router();
const db = require("../database"); //db hace referencia a la BBDD
const queryObjetos= "SELECT * FROM objetos";
const queryJugadores = "select j.id_partida,j.id_jugador,u.usuario,u.full_name,u.pictureURL FROM jugadores j LEFT JOIN usuarios u ON j.id_jugador=u.id ";

router.get('/', async (req,res)=>{
    res.render('index');
} );

router.get('/pagina_aux1',(req,res)=>{
    res.render('pagina_aux1');
} );

router.get('/pagina_aux2',(req,res)=>{
    res.render('pagina_aux2');
} );



module.exports=router;