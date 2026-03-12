from repository.sede_repository import *



def obtener_sedes():
    rows = get_all_sedes()

    sedes = []
    for row in rows:
        sedes.append({
            "id_sede": row["id_sede"],
            "nombre": row["nombre"],
            "ciudad": row["ciudad"],
            "direccion": row["direccion"]
        })

    return sedes
