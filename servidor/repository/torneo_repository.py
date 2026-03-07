from service.db_session import db_session

def obtener_todos_torneos():
   with db_session() as cursor:
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

def obtener_torneos_por_usuario(id_usuario):
    with db_session() as cursor:
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


def eliminar_usuario_de_torneo(id_usuario, id_torneo):
    with db_session() as cursor:
        cursor.execute("""
        DELETE FROM usuarios_torneos
        WHERE id_usuario = %s AND id_torneo = %s
    """, (id_usuario, id_torneo))

        return cursor.rowcount


def usuario_ya_inscripto(id_usuario, id_torneo):
    with db_session() as cursor:
        cursor.execute("""
        SELECT 1
        FROM usuarios_torneos
        WHERE id_usuario = %s AND id_torneo = %s
        LIMIT 1
    """, (id_usuario, id_torneo))

        return cursor.fetchone() is not None


def insertar_inscripcion(id_usuario, data):
    with db_session() as cursor:
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

def obtener_inscriptos_por_torneo(id_torneo):
    with db_session() as cursor:
        cursor.execute("""
                       SELECT ut.id_usuario,
                       ut.fecha_inscripcion,
                       u.usuario,
                       u.nombre,
                       u.apellido,
                       u.dni,
                       u.telefono,
                       u.email
                       FROM usuarios_torneos ut
                       JOIN usuario u ON ut.id_usuario = u.id_usuario
                       WHERE ut.id_torneo = %s
                       """, (id_torneo,))
        
        return cursor.fetchall()