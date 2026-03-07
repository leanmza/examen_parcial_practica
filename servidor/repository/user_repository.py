from service.db_session import db_session

def obtener_id_usuario_por_username(username):
    with db_session() as cursor:
        cursor.execute("""
        SELECT id_usuario
        FROM usuario
        WHERE usuario = %s
    """, (username,))

        user = cursor.fetchone()
        if not user:
            return None

        return user["id_usuario"]