from service.db_session import db_session

def save_torneo(data):
    with db_session() as cursor:
        cursor.execute("""
                       INSERT INTO torneos
                       (id_sede, nombre_torneo, fecha)
                       VALUES (%s, %s, %s)
                       """, (
                           data["id_sede"],
                           data["nombre_torneo"],
                           data["fecha"],
                       ) )
        
        return cursor.lastrowid
    
def update_torneo(data):
    with db_session() as cursor:
        cursor.execute("""
                       UPDATE torneos
                       SET id_sede=%s,
                       fecha = %s,
                       nombre_torneo = %s
                       WHERE id_torneo = %s                       
                       """, (
                           data["id_sede"],
                           data["fecha"],
                           data["nombre_torneo"],
                           data["id_torneo"]
                        ))
        
def delete_torneo_por_id(id_torneo):
    with db_session() as cursor:
        cursor.execute("""
                       DELETE FROM torneos
                       WHERE id_torneo = %s
                       """, (id_torneo,)) 
        
        return cursor.rowcount       