# newNodejs

en ./database/     hay que introducir un backup de la base de datos en MySQL

Crear  ./src/keys.js   configurar la BBDD, por ejemplo

        module.exports ={
            database:{
                host:'mydbhost',
                user:'myuser',
                password:'mypass',
                database:'mydatabasename',
                }
        }

npm run dev para iniciar la app
# newNodejsCRUD

Copiar en la carpeta database  el backup

EJECUTAR: source /home/ubuntu/killer/database/killer.sql;

source D:\DEVELOPMENT\dev\killer\database\killer.sql
