CREATE SCHEMA IF NOT EXISTS dungeon;

CREATE TABLE dungeon.`mensajes` (
  `id_mensaje` bigint(20) AUTO_INCREMENT UNIQUE PRIMARY KEY NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(30) DEFAULT NULL,
  `email` varchar(30) DEFAULT NULL,
  `motivo` varchar(15) NOT NULL,
  `mensaje` VARCHAR(200) NOT NULL);
  
  CREATE TABLE dungeon.`usuario` (
  `id_usuario` bigint(20) AUTO_INCREMENT UNIQUE PRIMARY KEY NOT NULL,
  `usuario` varchar(50)NOT NULL UNIQUE,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(30) NOT NULL,
  `dni` varchar(8) NOT NULL UNIQUE,
  `telefono` varchar(30) NOT NULL,
  `email` varchar(30) NOT NULL UNIQUE,
  `nacimiento` date NOT NULL,
  `password` varchar(255) NOT NULL,
  `foto` varchar(255) DEFAULT NULL);

  CREATE TABLE dungeon.`sedes` (
  `id_sede` bigint(20) AUTO_INCREMENT UNIQUE PRIMARY KEY NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `direccion` varchar(30) NOT NULL,
  `ciudad` varchar(30) NOT NULL,
  `pais` varchar(15) NOT NULL);
   
CREATE TABLE dungeon.`torneos` (
  `id_torneo` bigint(20) AUTO_INCREMENT UNIQUE PRIMARY KEY NOT NULL,
  `id_sede` bigint NOT NULL,
  `fecha` DATE NOT NULL,
  CONSTRAINT fk_torneo_sede
    FOREIGN KEY (id_sede) REFERENCES sedes(id_sede)
);

CREATE TABLE dungeon.`jugadores_torneos` (
  `identificador` VARCHAR(10) NOT NULL UNIQUE,
  `id_usuario` bigint(20) NOT NULL,
  `id_torneo` bigint(20) NOT NULL,
  `fecha_inscripcion` DATE NOT NULL,

  PRIMARY KEY (id_usuario, id_torneo),

  CONSTRAINT fk_jt_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_jt_torneo
    FOREIGN KEY (id_torneo)
    REFERENCES torneos(id_torneo)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);


INSERT INTO dungeon.sedes (nombre, direccion, ciudad, pais) VALUES
('Magic house', 'Rivadavia 123', 'Mendoza', 'Argentina'), 
('Arena Magic', 'España 456', 'San Juan', 'Argentina'),
('Gathering Vault', 'San Martin 789', 'San Luis', 'Argentina');

INSERT INTO dungeon.torneos (id_sede, fecha) VALUES
(1, '2025-03-15'),
(2, '2025-03-22'),
(3, '2025-04-05');
