DROP TABLE IF EXISTS sessions;

DROP TABLE IF EXISTS partidajugadores;

DROP TABLE IF EXISTS partidaobjetos;

DROP TABLE IF EXISTS objetos;

DROP TABLE IF EXISTS partidas;

DROP TABLE IF EXISTS usuarios;

CREATE TABLE `usuarios` (
  `id` int(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(250) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `full_name` varchar(200) DEFAULT NULL,
  `privilegio` varchar(30) DEFAULT NULL,
  `pictureURL` varchar(100) CHARACTER SET utf16 COLLATE utf16_spanish2_ci DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de usuarios';

CREATE TABLE `objetos` (
  `id` int(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(250) DEFAULT NULL,
  `pictureURL` varchar(100) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = latin1 COMMENT = 'tabla de objetos';

CREATE TABLE `partidas` (
  `id` int(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
  `titulo` varchar(50) DEFAULT NULL,
  `descripcion` varchar(250) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `activa` boolean default 0
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de info de partidas';

CREATE TABLE `partidajugadores` (
  `id_partida` int(11) NOT NULL,
  `id_jugador` int(11) DEFAULT NULL,
  primary key (id_partida, id_jugador),
  FOREIGN KEY (id_partida) REFERENCES partidas(id),
  FOREIGN KEY (id_jugador) REFERENCES usuarios(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de jugadores de juegos';

CREATE TABLE `partidaobjetos` (
  `id_partida` int(11) NOT NULL,
  `id_objeto` int(11) DEFAULT NULL,
  primary key (id_partida, id_objeto),
  FOREIGN KEY (id_partida) REFERENCES partidas(id),
  FOREIGN KEY (id_objeto) REFERENCES objetos(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de objetos de juegos';

CREATE TABLE `partidasenjuego` (
  `id_partida` int(11) NOT NULL,
  `id_jugador` int(11) NOT NULL,
  `id_victima` int(11) NOT NULL,
  `id_objeto` int(11) NOT NULL,
  `asesinatos` int(11) DEFAULT 0,
  `ticket` boolean DEFAULT 0,
  `victima_killed` boolean DEFAULT 0,
  `fecha_asesinato` DATE DEFAULT NULL,
  primary key (id_partida, id_jugador, id_victima),
  FOREIGN KEY (id_partida) REFERENCES partidas(id),
  FOREIGN KEY (id_objeto) REFERENCES objetos(id),
  FOREIGN KEY (id_jugador) REFERENCES usuarios(id),
  FOREIGN KEY (id_victima) REFERENCES usuarios(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de partidas en juego';

/* drop table tickets;
 
 CREATE TABLE `tickets` (
 `id_partida` int(11) NOT NULL,
 `id_jugador` int(11) NOT NULL,
 `id_victima` int(11) NOT NULL,
 
 FOREIGN KEY (id_partida) REFERENCES partidas(id),
 FOREIGN KEY (id_jugador) REFERENCES usuarios(id),
 FOREIGN KEY (id_victima) REFERENCES usuarios(id)
 ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tickets de partidas en juego'; */

INSERT INTO `usuarios` (`id`, `usuario`, `contrasena`, `email`, `full_name`, `privilegio`, `pictureURL`) VALUES
(1, 'admin', '$2a$10$44RiEqgdwBZhtbd1rN6pfe/CLbTMpc4mGUPDiCgAlle0ISkMuJAC2', 'admin@email.com', 'Admin name', 'admin', '87257d98-58f6-4525-94a5-2d8c5dbbb4d1.jpg'),
(2, 'uno', '$2a$10$ii5iMUZq87m8hK/sD4/LVu2OQdvNOGyKLEphRPGG1.Npee2Gpjt66', '1@1.es', 'uno', 'san', NULL),
(3, 'dos', '$2a$10$XpxNWmS5qJUMg11uI4HcAuJdc7IkC1SQNFN5GM5xLiKlMa3uH7QOG', '2@2.es', 'dos', 'san', 'abe35bc2-558f-4fde-bd87-780f7511fa8e.jpg'),
(4, 'tres', '$2a$10$pofTnnYsWwWJ3GpLwiygbOMJlNQv22NAUqEv73/L.HFchhyY1B12e', 'tres@tres.es', 'nombre del tres', 'none', NULL);


INSERT INTO `partidas` (`id`, `titulo`, `descripcion`, `fecha_inicio`, `fecha_fin`, `activa`) VALUES
(1, 'Escola Destiu', 'Partida con los compis', '2023-09-13', '2023-10-26', 1),
(2, 'partida2', 'lkadjglkj', '2023-09-13', '2023-09-30', 0);

 INSERT INTO `objetos` (`id`, `nombre`, `descripcion`, `pictureURL`) VALUES
(1, 'cuchara', 'Una cuchara de metal', 'asd'),
(2, 'Botella de agua', 'de 1,5L', ''),
(3, 'prueba', 'prueba objeto', ''),
(4, 'erteyr', 'etyy', ''),
(5, 'dfgjfgjmfghk', 'fghkgklgk', ''),
(6, 'cmvbm,', 'vbm,,', ''),
(7, 'cuchara', 'de metal', ''),
(9, 'cuchillo', 'de plastico', ''),
(10, 'ventilador', 'de 230v', ''),
(11, 'prueba', 'q va', '');


INSERT INTO `partidajugadores` (`id_partida`, `id_jugador`, `asesinatos`) VALUES
(1, 1, 0),
(1, 2, 0),
(1, 3, 0),
(2, 1, 0),
(2, 2, 0),
(2, 3, 0);

INSERT INTO `partidaobjetos` (`id_partida`, `id_objeto`) VALUES
(1, 9),
(1, 10),
(1, 11);



INSERT INTO `partidasenjuego` (`id_partida`, `id_jugador`, `id_victima`, `id_objeto`, `asesinatos`, `ticket`) VALUES
(1, 1, 2, 9, 0, 0),
(1, 2, 3, 10, 0, 0),
(1, 3, 1, 11, 0, 0);


