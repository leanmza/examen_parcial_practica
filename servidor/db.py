from mysql.connector import connect, IntegrityError
MENSAJE_ERROR_CONEXION = "Falló la conexión a base de datos."
try:
    db = connect(
        host="localhost",
        user="root",
        password="root",
        port=3306,
        database="dungeon"
    )
    cursor = db.cursor(dictionary=True)
except Exception:
    db = cursor = None
__all__ = ["IntegrityError", "db", "cursor"]

# query para crear la BD y las tablas
# CREATE SCHEMA dungeon;

# CREATE TABLE dungeon.`mensajes` (
#   `id_mensaje` int(11) AUTO_INCREMENT UNIQUE PRIMARY KEY NOT NULL,
#   `nombre` varchar(50) NOT NULL,
#   `apellido` varchar(30) DEFAULT NULL,
#   `email` varchar(30) DEFAULT NULL,
#   `motivo` varchar(15) NOT NULL,
#   `mensaje` VARCHAR(200) NOT NULL);
  
#   CREATE TABLE dungeon.`jugadores` (
#   `id_jugador` int(11) AUTO_INCREMENT UNIQUE PRIMARY KEY NOT NULL,
#   `nombre` varchar(50) NOT NULL,
#   `apellido` varchar(30) NOT NULL,
#   `telefono` varchar(30) NOT NULL,
#   `edad` int(3) NOT NULL,
#    `direccion` varchar(50) NOT NULL,
# 	`sede` varchar(30) NOT NULL,
#     `fecha` varchar(30) NOT NULL,
#     `identificador` varchar(10) NOT NULL);
   
 