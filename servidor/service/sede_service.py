from repository.sede_repository import *
from utils.validators import validate_fields



def obtener_sedes():
    rows = get_all_sedes()

    sedes = []
    for row in rows:
        sedes.append({
            "id_sede": row["id_sede"],
            "nombre": row["nombre"],
            "ciudad": row["ciudad"],
            "direccion": row["direccion"],
            "pais": row["pais"]
        })

    return sedes


def registrar_sede(data):
    validate_fields(data, ["nombre",
                           "direccion",
                           "ciudad", 
                           "pais"
                           ])

    id_sede = save_sede(data)
    
    sede = buscar_sede_por_id(id_sede)
     
    return {"ok": True,
            "mensaje": "Sede registrada",
            "sede": sede
            }

def actualizar_sede(data):
    validate_fields(data, ["nombre",
                           "direccion",
                           "ciudad", 
                           "pais",
                           "id_sede",
                           ])

    id_sede = update_sede(data)
    
    sede = buscar_sede_por_id(id_sede)
     
    return {"ok": True,
            "mensaje": "Sede actualizada",
            "sede": sede
            }

def baja_sede(data):
    validate_fields(data, ["id_sede"])

    resultado = delete_sede_por_id(data["id_sede"])
    
    if resultado == 0:
        raise ValueError("No se encontró la sede a eliminar")
    
    return {"ok": True,
            "mensaje": "Sede eliminada"}