const queries = {
    queryUsuarios: "select * from usuarios",
    queryPartidas: "select * from partidas",
    queryPartidaObjetos: "select * from partidaobjetos po LEFT JOIN objetos o ON po.id_objeto=o.id",
    queryPartidaJugadores: "select * from partidajugadores pj LEFT JOIN usuarios u ON pj.id_jugador=u.id",
    queryPartidasActivas: "select pej.id_partida,pej.id_jugador, pej.id_victima, pej.id_objeto,pej.asesinatos,pej.ticket,pej.victima_killed,pej.fecha_asesinato,p.titulo,p.descripcion,p.fecha_inicio,p.fecha_fin,p.activa,uv.usuario as victima_user, uv.full_name as victima_name,uv.pictureURL as foto_victima, ua.full_name as jugador_name ,ua.usuario as jugador_user,o.nombre as objeto,o.descripcion as descripcion_objeto from partidasenjuego pej LEFT JOIN partidas p ON pej.id_partida=p.id LEFT JOIN usuarios uv ON uv.id=pej.id_victima LEFT JOIN objetos o ON o.id=pej.id_objeto LEFT JOIN usuarios ua ON ua.id=pej.id_jugador",
};

module.exports = queries;