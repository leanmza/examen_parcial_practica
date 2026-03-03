def obtener_todos_torneos(cursor):
   cursor.execute("""
        SELECT 
            t.id_torneo,
            t.nombre_torneo,
            t.fecha,
            s.id_sede,
            s.nombre AS sede_nombre,
            s.ciudad AS sede_ciudad,
            s.direccion AS sede_direccion
        FROM torneos t
        JOIN sedes s ON t.id_sede = s.id_sede
    """)
   return cursor.fetchall()

def obtener_torneos_por_usuario(cursor, id_usuario):
    cursor.execute("""
        SELECT
            t.id_torneo,
            t.fecha,
            s.nombre AS sede_nombre,
            s.ciudad AS sede_ciudad,
            jt.identificador,
            jt.fecha_inscripcion
        FROM usuarios_torneos jt
        JOIN torneos t ON jt.id_torneo = t.id_torneo
        JOIN sedes s ON t.id_sede = s.id_sede
        WHERE jt.id_usuario = %s
    """, (id_usuario,))

    return cursor.fetchall()


def eliminar_usuario_de_torneo(cursor, id_usuario, id_torneo):
    cursor.execute("""
        DELETE FROM usuarios_torneos
        WHERE id_usuario = %s AND id_torneo = %s
    """, (id_usuario, id_torneo))

    return cursor.rowcount


def usuario_ya_inscripto(cursor, id_usuario, id_torneo):
    cursor.execute("""
        SELECT 1
        FROM usuarios_torneos
        WHERE id_usuario = %s AND id_torneo = %s
        LIMIT 1
    """, (id_usuario, id_torneo))

    return cursor.fetchone() is not None


def insertar_inscripcion(cursor, id_usuario, data):
    cursor.execute("""
        INSERT INTO usuarios_torneos
        (id_usuario, id_torneo, identificador, fecha_inscripcion)
        VALUES (%s, %s, %s, %s)
    """, (
        id_usuario,
        data["id_torneo"],
        data["identificador"],
        data["fecha_inscripcion"],
    ))

