import mysql.connector 
from mysql.connector import IntegrityError, Error
MENSAJE_ERROR_CONEXION = "Falló la conexión a base de datos."
MENSAJE_ERROR_UNIQUE = "Nombre de usuario/dni/email ya existente."
def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="dungeon"
    )
