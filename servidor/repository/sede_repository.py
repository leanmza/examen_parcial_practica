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