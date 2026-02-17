from mysql.connector import connect, IntegrityError
MENSAJE_ERROR_CONEXION = "Falló la conexión a base de datos."
MENSAJE_ERROR_UNIQUE = "Nombre de usuario/dni/email ya existente."
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

