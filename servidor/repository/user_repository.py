def obtener_id_usuario_por_username(cursor, username):
    cursor.execute("""
        SELECT id_usuario
        FROM usuario
        WHERE usuario = %s
    """, (username,))

    user = cursor.fetchone()
    return user["id_usuario"] if user else None