from service.db_session import db_session

def save_mensaje(data):
    with db_session() as cursor:
            cursor.execute("""
            INSERT INTO mensajes
            (nombre, apellido, email, motivo, mensaje)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data["nombre"],
            data["apellido"],
            data["email"],
            data["motivo"],
            data["mensaje"]
        ))
            