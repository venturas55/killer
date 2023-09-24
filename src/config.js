require('dotenv').config();
 const PORT = process.env.PORT || 4000;
 const DB_HOST = process.env.DB_HOST || 'localhost';
 const DB_USER = process.env.DB_USER || 'usuario';
 const DB_PASS = process.env.DB_PASS || 'contrasena';
 const DB_NAME = process.env.DB_NAME || 'dbname';
 const DB_PORT = process.env.DB_PORT || 3306;

 module.exports = {
     database: {
         host: DB_HOST,
         user: DB_USER,
         password: DB_PASS,
         database: DB_NAME,
     }
 }