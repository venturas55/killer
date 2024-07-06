drop database killer2;
create database killer2;
use killer2;
DROP TABLE IF EXISTS sessions;

DROP TABLE IF EXISTS partidajugadores;

DROP TABLE IF EXISTS partidaobjetos;

DROP TABLE IF EXISTS objetos;

DROP TABLE IF EXISTS partidas;

DROP TABLE IF EXISTS usuarios;

DROP TABLE IF EXISTS partidasenjuego;

CREATE TABLE `usuarios` (
  `id` int(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(250) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `full_name` varchar(200) DEFAULT NULL,
  `privilegio` varchar(30) DEFAULT NULL,
  `pictureURL` varchar(100) CHARACTER SET utf16 COLLATE utf16_spanish2_ci DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de usuarios';

CREATE TABLE `partidas` (
  `id` varchar(5) PRIMARY KEY,
  `titulo` varchar(50) DEFAULT NULL,
  `descripcion` varchar(250) DEFAULT NULL,
  `fecha_inicio` TIMESTAMP,
  `fecha_fin` TIMESTAMP,
  `id_creador` int(11),
  `status` enum ('encreacion', 'enpausa', 'enjuego','enedicion') default 'encreacion',
  FOREIGN KEY (id_creador) REFERENCES usuarios(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de info de partidas';

/* / / onpause onplay oncreation  */
CREATE TABLE `jugadores` (
  `id_partida` varchar(5) NOT NULL,
  `id_jugador` int(11) DEFAULT NULL,
  `imagenAlive` varchar(100) DEFAULT NULL,
  `imagenDead` varchar(100) DEFAULT NULL,
  primary key (id_partida, id_jugador),
  FOREIGN KEY (id_partida) REFERENCES partidas(id),
  FOREIGN KEY (id_jugador) REFERENCES usuarios(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de jugadores';

CREATE TABLE `objetos` (
  `id` int(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(250) DEFAULT NULL,
  `pictureURL` varchar(100) DEFAULT NULL,
  `id_partida` varchar(5),
  FOREIGN KEY (id_partida) REFERENCES partidas(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de objetos';

CREATE TABLE `partidasenjuego` (
  `id` int(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
  `id_partida` varchar(5) NOT NULL,
  `id_jugador` int(11) NOT NULL,
  `id_victima` int(11) NOT NULL,
  `id_objeto` int(11) NOT NULL,
  `asesinatos` int(11) DEFAULT 0,
  `ticket` boolean DEFAULT 0,
  `eliminado` boolean DEFAULT 0,
  `fecha_asesinato` TIMESTAMP DEFAULT 0,
  FOREIGN KEY (id_partida) REFERENCES partidas(id),
  FOREIGN KEY (id_objeto) REFERENCES objetos(id),
  FOREIGN KEY (id_jugador) REFERENCES usuarios(id),
  FOREIGN KEY (id_victima) REFERENCES usuarios(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de partidas en juego';

CREATE TABLE eliminaciones (
  id_eliminacion int(11) AUTO_INCREMENT PRIMARY KEY,
  id_partida varchar(5) NOT NULL,
  id_asesino int(11),
  id_victima int(11),
  id_objeto int(11),
  fecha_eliminacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_partida) REFERENCES partidas(id),
  FOREIGN KEY (id_asesino) REFERENCES usuarios(id),
  FOREIGN KEY (id_victima) REFERENCES usuarios(id),
  FOREIGN KEY (id_objeto) REFERENCES objetos(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de eliminaciones en juego';

CREATE TABLE solicitudes (
  id_partida varchar(5) NOT NULL,
  id_jugador int(11) NOT NULL,
  FOREIGN KEY (id_partida) REFERENCES partidas(id),
  FOREIGN KEY (id_jugador) REFERENCES usuarios(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de solicituddes en juego';

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
    '87257d98-58f6-4525-94a5-2d8c5dbbb4d1.jpg'
  ),
  (
    2,
    'uno',
    '$2a$10$x1/8kTsVlNtfNDpSmkLs0eXvgkTB5YLPXIn7FvZtXaWEO6YzcOSF2',
    '1@1.es',
    'uno',
    'none',
    NULL
  ),
  (
    3,
    'dos',
    '$2a$10$XpxNWmS5qJUMg11uI4HcAuJdc7IkC1SQNFN5GM5xLiKlMa3uH7QOG',
    '2@2.es',
    'dos',
    'none',
    'abe35bc2-558f-4fde-bd87-780f7511fa8e.jpg'
  ),
  (
    4,
    'tres',
    '$2a$10$pofTnnYsWwWJ3GpLwiygbOMJlNQv22NAUqEv73/L.HFchhyY1B12e',
    'tres@tres.es',
    'nombre del tres',
    'none',
    NULL
  );