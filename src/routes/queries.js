const queries = {
    queryUsuarios: "select * from usuarios",
    queryPartidas: "select p.id as id_partida,p.titulo,p.descripcion,p.fecha_inicio, p.fecha_fin,p.status,p.id_creador,u.id as id_usuario,u.usuario,u.email,u.full_name,u.privilegio,u.pictureURL from partidas p LEFT JOIN usuarios u ON p.id_creador=u.id",
    queryEliminaciones: "select * from eliminaciones",
    queryObjetos: "select * from objetos",
    queryPartidasEnJuego: "select * from partidasenjuego",
    queryJugadores: "select * from jugadores j LEFT JOIN usuarios u ON j.id_jugador=u.id",

    queryPartidasJugador: "select * from jugadores j left join partidas p ON j.id_partida=p.id",
    queryPartidasPropias: "select p.id as id_partida,p.titulo,p.descripcion,p.fecha_inicio, p.fecha_fin,p.status,p.id_creador, u.id as id_usuario,u.usuario,u.contrasena,u.email,u.full_name,u.privilegio,u.pictureURL from partidas p left join usuarios u ON u.id=p.id_creador",
    queryPartidasAjenas:  "select p.id,p.titulo,p.descripcion,p.fecha_inicio, p.fecha_fin,p.status,p.id_creador,pej.id_jugador,pej.id_victima,pej.id_objeto from partidas p LEFT JOIN partidasenjuego pej ON p.id=pej.id_partida",

    queryEliminacionesUsuariosObjetos: "select e.id_eliminacion, e.id_partida,e.id_asesino,e.id_victima,e.id_objeto,e.fecha_eliminacion, ua.full_name as asesino_name, ua.usuario as asesino_user,uv.usuario as victima_user, uv.full_name as victima_name,o.nombre as objeto, o.descripcion, o.pictureURL as objeto_pictureURL from eliminaciones e LEFT JOIN usuarios ua ON e.id_asesino=ua.id LEFT JOIN usuarios uv ON e.id_victima=uv.id LEFT JOIN objetos o ON e.id_objeto=o.id " ,

    queryPartidasActivas: "select pej.id_partida,pej.id_jugador,pej.id_victima, pej.eliminado, pej.id_objeto,pej.asesinatos,pej.ticket,pej.eliminado,pej.fecha_asesinato,p.titulo,p.descripcion,p.id_creador,p.fecha_inicio,p.fecha_fin,p.status,uv.usuario as victima_user, uv.full_name as victima_name,uv.pictureURL as foto_victima, ua.full_name as jugador_name ,ua.usuario as jugador_user,o.nombre as objeto,o.descripcion as descripcion_objeto from partidasenjuego pej LEFT JOIN partidas p ON pej.id_partida=p.id LEFT JOIN usuarios uv ON uv.id=pej.id_victima LEFT JOIN objetos o ON o.id=pej.id_objeto LEFT JOIN usuarios ua ON ua.id=pej.id_jugador",
};

module.exports = queries;