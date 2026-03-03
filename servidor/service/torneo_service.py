from service.db_session import db_session
from repository.torneo_repository import *
from repository.user_repository import obtener_id_usuario_por_username


# ---------------------------------------------------
# Helpers
# ---------------------------------------------------

def get_id_usuario_from_identity(identity):
    with db_session() as cursor:
        cursor.execute("""
        SELECT id_usuario
        FROM usuario
        WHERE usuario = %s
    """, (identity,))
    user = cursor.fetchone()
    return user["id_usuario"] if user else None


def obtener_id_usuario(identity, cursor):
    """
    Convierte username (JWT identity) → id_usuario (DB)
    Requiere cursor activo.
    """

    cursor.execute("""
        SELECT id_usuario
        FROM usuario
        WHERE usuario = %s
    """, (identity,))

    user = cursor.fetchone()
    if not user:
        raise ValueError("Usuario no encontrado")

    if not user:
        return None

    return user["id_usuario"]

# ---------------------------------------------------
# LÓGICA DE NEGOCIO
# ---------------------------------------------------


def obtener_torneos():
    with db_session() as cursor:

        rows = obtener_todos_torneos(cursor)

    torneos = []
    for row in rows:
        torneos.append({
            "id_torneo": row["id_torneo"],
            "nombre_torneo": row["nombre_torneo"],
            "fecha": row["fecha"].strftime("%d-%m-%Y"),
            "sede": {
                "id_sede": row["id_sede"],
                "nombre": row["sede_nombre"],
                "ciudad": row["sede_ciudad"],
                "direccion": row["sede_direccion"]
            }
        })

    return torneos


def inscribir_usuario(identity, data):

    required = ["id_torneo", "identificador", "fecha_inscripcion"]
    for field in required:
        if field not in data:
            raise ValueError(f"Falta el campo {field}")

    with db_session() as cursor:

        id_usuario = obtener_id_usuario_por_username(cursor, identity)

        if not id_usuario:
            raise ValueError("Usuario no encontrado")

        if usuario_ya_inscripto(cursor, id_usuario, data["id_torneo"]):
            raise ValueError("El usuario ya está inscripto")

        insertar_inscripcion(cursor, id_usuario, data)

    return {"ok": True,
            "mensaje": "Inscripción realizada correctamente"
            }


def baja_usuario_torneo(identity, data):

    if not data or "id_torneo" not in data:
        raise ValueError("Falta id_torneo")

    with db_session() as cursor:

        id_usuario = obtener_id_usuario_por_username(cursor, identity)

        if not id_usuario:
            raise ValueError("Usuario no encontrado")

        filas = eliminar_usuario_de_torneo(
            cursor, id_usuario, data["id_torneo"])

        if filas == 0:
            raise ValueError("No se encontró el registro")

    return {"ok": True,
            "mensaje": "Usuario eliminado del torneo"
            }


def obtener_torneos_usuario(identity):

    with db_session() as cursor:

        id_usuario = obtener_id_usuario_por_username(cursor, identity)

        if not id_usuario:
            return []

        rows = obtener_torneos_por_usuario(cursor, id_usuario)

        return [
            {
                "id_torneo": row["id_torneo"],
                "fecha": row["fecha"].strftime("%d-%m-%Y"),
                "sede": {
                    "nombre": row["sede_nombre"],
                    "ciudad": row["sede_ciudad"]
                },
                "identificador": row["identificador"],
                "fecha_inscripcion": row["fecha_inscripcion"].strftime("%d-%m-%Y")
            }
            for row in rows
        ]
