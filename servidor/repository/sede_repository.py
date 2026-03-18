from service.db_session import db_session

def get_all_sedes():
    with db_session() as cursor:
        cursor.execute("""
                       SELECT id_sede,
                            nombre,
                            direccion,
                            ciudad,
                            pais
                        FROM sedes
                       """)
        return cursor.fetchall()
    
def save_sede(data):
    with db_session() as cursor:
        cursor.execute("""
                       INSERT INTO sedes (nombre, direccion, ciudad, pais)
                       VALUES (%s, %s, %s, %s)
                       """, (data["nombre"], data["direccion"], data["ciudad"], data["pais"]))
        return cursor.lastrowid
    
def buscar_sede_por_id(id_sede):
    with db_session() as cursor:
        cursor.execute("""
                       SELECT id_sede,
                            nombre,
                            direccion,
                            ciudad,
                            pais
                        FROM sedes
                        WHERE id_sede = %s
                       """, (id_sede,))
        return cursor.fetchone()
    
def update_sede(data):
    with db_session() as cursor:
        cursor.execute("""
                       UPDATE sedes
                       SET nombre = %s,
                           direccion = %s,
                           ciudad = %s,
                           pais = %s
                       WHERE id_sede = %s
                       """, (data["nombre"], data["direccion"], data["ciudad"], data["pais"], data["id_sede"]))

def delete_sede_por_id(id_sede):
    with db_session() as cursor:
        cursor.execute("""
                       DELETE FROM sedes
                       WHERE id_sede = %s
                       """, (id_sede,)) 
        
        return cursor.rowcount