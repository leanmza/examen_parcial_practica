from repository.torneo_repository import *
from repository.user_repository import obtener_id_usuario_por_username
from utils.validators import validate_fields

# ---------------------------------------------------
# LÓGICA DE NEGOCIO
# ---------------------------------------------------


def obtener_torneos():
    rows = obtener_todos_torneos()

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

def obtener_inscriptos(id_torneo):
    rows = obtener_inscriptos_por_torneo(id_torneo)
    inscriptos = []
    for row in rows:
        inscriptos.append({
                "id_usuario": row["id_usuario"],
                "usuario": row["usuario"],
                "nombre": row["nombre"],
                "apellido": row["apellido"],
                "dni": row["dni"],
                "telefono": row["telefono"],
                "email": row["email"],
                "fecha_inscripcion": row["fecha_inscripcion"]
                
            })
    return inscriptos


def inscribir_usuario(identity, data):
    
    validate_fields(data, ["id_torneo",
                           "identificador",
                           "fecha_inscripcion"
                           ])
  
  
    id_usuario = obtener_id_usuario_por_username(identity)

    if not id_usuario:
            raise ValueError("Usuario no encontrado")
        
    if not data["id_torneo"]:
        raise ValueError("Debe seleccionar un torneo")
        

    if usuario_ya_inscripto(id_usuario, data["id_torneo"]):
            raise ValueError("El usuario ya está inscripto en este torneo")

    insertar_inscripcion(id_usuario, data)

    return {"ok": True,
            "mensaje": "Inscripción realizada correctamente"
            }


def baja_usuario_torneo(identity, data):
    
    validate_fields(data, ["id_torneo"
                           ])
    
    id_usuario = obtener_id_usuario_por_username(identity)

    if not id_usuario:
            raise ValueError("Usuario no encontrado")

    filas = eliminar_usuario_de_torneo(
            id_usuario, data["id_torneo"])

    if filas == 0:
            raise ValueError("No se encontró el registro")

    return {"ok": True,
            "mensaje": "Usuario eliminado del torneo"
            }


def obtener_torneos_usuario(identity):

        id_usuario = obtener_id_usuario_por_username(identity)

        if not id_usuario:
            return []

        rows = obtener_torneos_por_usuario(id_usuario)
    
        return [
            {
                "id_torneo": row["id_torneo"],
                "nombre": row["nombre_torneo"],
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
