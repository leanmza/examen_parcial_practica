-- DROP SCHEMA dungeon;
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
  `nombre_torneo` VARCHAR(200) NOT NULL UNIQUE,
  `id_sede` bigint NOT NULL,
  `fecha` DATE NOT NULL,
  CONSTRAINT fk_torneo_sede
    FOREIGN KEY (id_sede) REFERENCES sedes(id_sede)
);

CREATE TABLE dungeon.`usuarios_torneos` (
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

CREATE TABLE dungeon.roles (
  id_rol BIGINT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  rol VARCHAR(20) UNIQUE NOT NULL
);

INSERT INTO dungeon.roles (rol) VALUES
('admin'),
('user');

CREATE TABLE dungeon.usuario_roles (
    id_usuario BIGINT,
    id_rol BIGINT,
    PRIMARY KEY (id_usuario, id_rol),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);



INSERT INTO dungeon.sedes (nombre, direccion, ciudad, pais) VALUES
('Magic house', 'Rivadavia 123', 'Mendoza', 'Argentina'), 
('Arena Magic', 'España 456', 'San Juan', 'Argentina'),
('Gathering Vault', 'San Martin 789', 'San Luis', 'Argentina');

INSERT INTO dungeon.torneos (nombre_torneo, id_sede, fecha) VALUES
('Batalla por Rávnica - Formato Standard', 1, '2026-03-15'),
('Guerra de los Planeswalkers - Modern', 2, '2026-03-22'),
('Dominio de los Cinco Colores - Commander', 3, '2026-04-05'),
('Draft Especial - Innistrad Nocturno', 1, '2026-04-12'),
('Clasificatorio Pioneer - Senderos del Multiverso', 2, '2026-04-19'),
('Copa Commander - Reliquias de Zendikar', 3, '2026-04-26');