const express = require('express');
const { Passport } = require('passport');
const router = express.Router();

const passport=require('passport');
const funciones = require('../lib/funciones');

const pool = require("../database");

router.get('/api/prueba',async (req,res)=>{
    //PARA GESTIONAR UNA API
    res.redirect(json);
});

module.exports = router;