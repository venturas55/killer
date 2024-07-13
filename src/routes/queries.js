const queries = {
    queryUsuarios: "select * from usuarios",
    queryPartidas: "select p.id as id_partida,p.titulo,p.descripcion,p.fecha_inicio, p.fecha_fin,p.status,p.id_creador,u.id as id_usuario,u.usuario,u.email,u.full_name,u.privilegio,u.pictureURL from partidas p LEFT JOIN usuarios u ON p.id_creador=u.id",
    queryEliminaciones: "select e.id_eliminacion, e.id_partida, e.id_asesino,e.id_victima,e.id_objeto,e.fecha_eliminacion, ua.full_name as asesino_name, ua.usuario as asesino_user, uv.usuario as victima_user, uv.full_name as victima_name,o.nombre as objeto, o.descripcion, o.pictureURL as objeto_pictureURL from eliminaciones e LEFT JOIN usuarios ua ON e.id_asesino=ua.id LEFT JOIN usuarios uv ON e.id_victima=uv.id LEFT JOIN objetos o ON o.id=e.id_objeto",
    queryObjetos: "select * from objetos",
    queryPartidasEnJuego: "select * from partidasenjuego",
    queryJugadores: "select * from jugadores j LEFT JOIN usuarios u ON j.id_jugador=u.id",

    queryPartidasJugador: "select * from jugadores j left join partidas p ON j.id_partida=p.id LEFT JOIN usuarios u ON u.id=p.id_creador",
    queryPartidasPropias: "select p.id as id_partida,p.titulo,p.descripcion,p.fecha_inicio, p.fecha_fin,p.status,p.id_creador, u.id as id_usuario,u.usuario,u.contrasena,u.email,u.full_name,u.privilegio,u.pictureURL from partidas p left join usuarios u ON u.id=p.id_creador",
    queryPartidasAjenas:  "select p.id,p.titulo,p.descripcion,p.fecha_inicio, p.fecha_fin,p.status,p.id_creador,pej.id_jugador,pej.id_victima,pej.id_objeto from partidas p LEFT JOIN partidasenjuego pej ON p.id=pej.id_partida",

    queryPartidasActivas: "select pej.id_partida,pej.id_jugador,pej.id_victima, pej.eliminado, pej.id_objeto,pej.asesinatos,pej.ticket,pej.eliminado,pej.fecha_asesinato,p.titulo,p.descripcion,p.id_creador,p.fecha_inicio,p.fecha_fin,p.status,uv.usuario as victima_user, uv.full_name as victima_name,uv.pictureURL as foto_victima, ua.full_name as jugador_name ,ua.usuario as jugador_user,o.nombre as objeto,o.descripcion as descripcion_objeto,uc.usuario as usuario_creador, uc.full_name as creador_name, uc.email as email_creador from partidasenjuego pej LEFT JOIN partidas p ON pej.id_partida=p.id LEFT JOIN usuarios uv ON uv.id=pej.id_victima LEFT JOIN objetos o ON o.id=pej.id_objeto LEFT JOIN usuarios ua ON ua.id=pej.id_jugador LEFT JOIN usuarios uc ON p.id_creador=uc.id",
};

module.exports = queries;

//CONSULTAR ASESINATOS
// select pej.id_partida,pej.id_jugador,pej.id_victima, pej.id_objeto,pej.asesinatos,pej.eliminado,pej.fecha_asesinato,uv.usuario as victima_user, uv.full_name as victima_name, ua.full_name as jugador_name ,ua.usuario as jugador_user,o.nombre as objeto from partidasenjuego pej LEFT JOIN partidas p ON pej.id_partida=p.id LEFT JOIN usuarios uv ON uv.id=pej.id_victima LEFT JOIN objetos o ON o.id=pej.id_objeto LEFT JOIN usuarios ua ON ua.id=pej.id_jugador LEFT JOIN usuarios uc ON p.id_creador=uc.id  WHERE pej.id_partida='U370A' and pej.asesinatos>0;
// select e.id_partida, e.id_asesino,e.id_victima,e.id_objeto,e.fecha_eliminacion, ua.full_name as asesino_full_name, ua.usuario as asesino_user,uv.full_name as victima_full_name, uv.usuario as victima_usuario,o.nombre,o.descripcion,o.pictureURL as objeto_pictureURL from eliminaciones e LEFT JOIN usuarios ua ON ua.id=e.id_asesino LEFT JOIN usuarios uv ON uv.id=e.id_victima LEFT JOIN objetos o ON o.id=e.id_objeto where e.id_partida='U370A';

