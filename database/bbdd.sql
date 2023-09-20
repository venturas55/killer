SET
  SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

START TRANSACTION;

SET
  time_zone = "+00:00";

/* USUARIOS y LOGS */
CREATE TABLE `usuarios` (
  `id` int(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(250) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `full_name` varchar(200) DEFAULT NULL,
  `privilegio` varchar(30) DEFAULT NULL,
  `pictureURL` varchar(100) CHARACTER SET utf16 COLLATE utf16_spanish2_ci DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de usuarios';

INSERT INTO
  `usuarios` (
    `id`,
    `usuario`,
    `contrasena`,
    `email`,
    `full_name`,
    `privilegio`,
    `pictureURL`
  )
VALUES
  (
    1,
    'admin',
    '$2a$10$44RiEqgdwBZhtbd1rN6pfe/CLbTMpc4mGUPDiCgAlle0ISkMuJAC2',
    'admin@email.com',
    'Admin name',
    'admin',
    ''
  );

DROP TABLE juegos;

DROP TABLE jugadores;

DROP TABLE objetos;

DROP TABLE partidas;

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
  `fecha_fin` date NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de info de partidas';

DROP table partidajugadores;

CREATE TABLE `partidajugadores` (
  `id_partida` int(11) NOT NULL,
  `id_jugador` int(11) DEFAULT NULL,
  primary key (id_partida, id_jugador),
  FOREIGN KEY (id_partida) REFERENCES partidas(id),
  FOREIGN KEY (id_jugador) REFERENCES usuarios(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de jugadores de juegos';

DROP table partidaobjetos;

CREATE TABLE `partidaobjetos` (
  `id_partida` int(11) NOT NULL,
  `id_objeto` int(11) DEFAULT NULL,
  primary key (id_partida, id_objeto),
  FOREIGN KEY (id_partida) REFERENCES partidas(id),
  FOREIGN KEY (id_objeto) REFERENCES objetos(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de objetos de juegos';

DROP table partidasenjuego;
CREATE TABLE `partidasenjuego` (
  `id_partida` int(11) NOT NULL,
  `id_jugador` int(11) NOT NULL,
  `victima` int(11) NOT NULL,
  `id_objeto` int(11) NOT NULL,
  `asesinatos` int(11) DEFAULT 0,
  primary key (id_partida, id_objeto, id_jugador),
  FOREIGN KEY (id_partida) REFERENCES partidas(id),
  FOREIGN KEY (id_objeto) REFERENCES objetos(id),
  FOREIGN KEY (id_jugador) REFERENCES usuarios(id),
  FOREIGN KEY (victima) REFERENCES usuarios(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de partidas en juego';