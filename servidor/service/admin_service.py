from repository.admin_repository import *
from repository.torneo_repository import buscar_torneo_por_id
from utils.validators import validate_fields

def registrar_torneo(data):
    
    validate_fields(data, ["id_sede",
                           "nombre_torneo",
                           "fecha"
                           ])    
    
    id_torneo = save_torneo(data)
    
    torneo = buscar_torneo_por_id(id_torneo)
     
    return {"ok": True,
            "mensaje": "Torneo registrado",
            "torneo": torneo
            }
    
def actualizar_torneo(data):
    
    validate_fields(data,["id_torneo",
                          "id_sede",
                          "nombre_torneo",
                          "fecha"
                          ])
    
    update_torneo(data)
    
    return buscar_torneo_por_id(data["id_torneo"])    

def baja_torneo(data):
    
    validate_fields(data,["id_torneo"])
    
    filas = delete_torneo_por_id(data["id_torneo"])

    if filas == 0:
            raise ValueError("No se encontró el registro")

    return {"ok": True,
            "mensaje": "Torneo eliminado del exitosamente"
            }
    
def baja_usuario_torneo(data):
    
    validate_fields(data,["id_usuario",
                          "id_torneo"])
    
    filas = delete_usuario_torneo_por_id(data)
    
    if filas == 0:
            raise ValueError("No se se encontró el registro")
        
    return {"ok": True,
            "mensaje": "Usuario borrado del torneo exitosamente"}