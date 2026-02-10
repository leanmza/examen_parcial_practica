CREATE SCHEMA dungeon;

CREATE TABLE dungeon.`mensajes` (
  `id_mensaje` int(11) AUTO_INCREMENT UNIQUE PRIMARY KEY NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(30) DEFAULT NULL,
  `email` varchar(30) DEFAULT NULL,
  `motivo` varchar(15) NOT NULL,
  `mensaje` VARCHAR(200) NOT NULL);
  
  CREATE TABLE dungeon.`jugadores` (
  `id_jugador` int(11) AUTO_INCREMENT UNIQUE PRIMARY KEY NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(30) NOT NULL,
  `dni` varchar(8) NOT NULL,
  `telefono` varchar(30) NOT NULL,
  `email` varchar(30) NOT NULL,
  `nacimiento` date NOT NULL);


  CREATE TABLE dungeon.`sedes` (
  `id_sede` int(11) AUTO_INCREMENT UNIQUE PRIMARY KEY NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `direccion` varchar(30) NOT NULL,
  `ciudad` varchar(30) NOT NULL,
  `pais` varchar(15) NOT NULL);
   
CREATE TABLE dungeon.`torneos` (
  `id_torneo` INT AUTO_INCREMENT PRIMARY KEY,
  `id_sede` INT NOT NULL,
  `fecha` DATE NOT NULL,
  CONSTRAINT fk_torneo_sede
    FOREIGN KEY (id_sede) REFERENCES sedes(id_sede)
);

CREATE TABLE dungeon.jugadores_torneos (
  identificador VARCHAR(10) NOT NULL UNIQUE,
  id_jugador INT NOT NULL,
  id_torneo INT NOT NULL,
  fecha_inscripcion DATE NOT NULL,

  PRIMARY KEY (id_jugador, id_torneo),

  CONSTRAINT fk_jt_jugador
    FOREIGN KEY (id_jugador)
    REFERENCES jugadores(id_jugador)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_jt_torneo
    FOREIGN KEY (id_torneo)
    REFERENCES torneos(id_torneo)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ;


INSERT INTO dungeon.sedes (nombre, direccion, ciudad, pais) VALUES
('Magic house', 'Rivadavia 123', 'Mendoza', 'Argentina'), 
('Arena Magic', 'España 456', 'San Juan', 'Argentina'),
('Gathering Vault', 'San Martin 789', 'San Luis', 'Argentina');

INSERT INTO dungeon.torneos (id_sede, fecha) VALUES
(1, '2025-03-15'),
(2, '2025-03-22'),
(3, '2025-04-05');
