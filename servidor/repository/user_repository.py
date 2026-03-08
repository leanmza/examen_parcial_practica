from service.db_session import db_session


def obtener_id_usuario_por_username(username):
    with db_session() as cursor:
        cursor.execute("""
        SELECT id_usuario
        FROM usuario
        WHERE usuario = %s
    """, (username,))

        user = cursor.fetchone()
        if not user:
            return None

        return user["id_usuario"]
    
def obtener_usuario_por_username(username):

    with db_session() as cursor:

        cursor.execute("""
            SELECT id_usuario, usuario, nombre, apellido,
                   dni, telefono, email, nacimiento, foto
            FROM usuario
            WHERE usuario = %s
        """, (username,))

        return cursor.fetchone()
    
def obtener_usuario_por_id(id_usuario):

    with db_session() as cursor:

        cursor.execute("""
            SELECT  u.id_usuario,
                    u.usuario,
                    u.nombre,
                    u.apellido,
                    u.email,
                    r.rol 
            FROM usuario u
            JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
            JOIN roles r ON ur.id_rol = r.id_rol
            WHERE u.id_usuario = %s
        """, (id_usuario,))

        return cursor.fetchone()

def obtener_usuario_logueado_y_rol(identity):
    with db_session() as cursor:
        cursor.execute("""
            SELECT  u.id_usuario,
                    u.usuario,
                    u.nombre,
                    u.apellido,
                    u.dni,
                    u.telefono,
                    u.email,
                    u.nacimiento,
                    u.foto,
                    r.rol
                    FROM usuario u
                    JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
                    JOIN roles r ON ur.id_rol = r.id_rol
            WHERE u.usuario = %s
        """, (identity,))
        
        return cursor.fetchone()

def save_usuario(data, pwd_hash):

    with db_session() as cursor:

        cursor.execute("""
            INSERT INTO usuario
            (usuario, nombre, apellido, dni, telefono, email, nacimiento, password)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            data["usuario"],
            data["nombre"],
            data["apellido"],
            data["dni"],
            data["telefono"],
            data["email"],
            data["nacimiento"],
            pwd_hash
        ))

        return cursor.lastrowid
    
def update_usuario(data, usuario_identity):

    with db_session() as cursor:

        cursor.execute("""
            UPDATE usuario
            SET nombre=%s,
                apellido=%s,
                telefono=%s,
                email=%s,
                nacimiento=%s
            WHERE usuario=%s
        """, (
            data["nombre"],
            data["apellido"],
            data["telefono"],
            data["email"],
            data["nacimiento"],
            usuario_identity
        ))
        
def asignar_rol(id_usuario, id_rol):

    with db_session() as cursor:

        cursor.execute("""
            INSERT INTO usuario_roles
            (id_usuario, id_rol)
            VALUES (%s,%s)
        """, (id_usuario, id_rol))
       
def get_id_role(rol):

    with db_session() as cursor:

        cursor.execute("""
            SELECT id_rol
            FROM roles
            WHERE rol = %s
        """, (rol,))

        role = cursor.fetchone()

        return role["id_rol"]   

def obtener_password_hash(usuario):

    with db_session() as cursor:

        cursor.execute("""
            SELECT password
            FROM usuario
            WHERE usuario = %s
        """, (usuario,))

        return cursor.fetchone()

def actualizar_password(usuario, pwd_hash):

    with db_session() as cursor:

        cursor.execute("""
            UPDATE usuario
            SET password = %s
            WHERE usuario = %s
        """, (pwd_hash, usuario))
       
def obtener_usuario_con_rol(usuario):

    with db_session() as cursor:

        cursor.execute("""
            SELECT u.foto,
                   u.email,
                   u.nombre,
                   u.usuario,
                   r.rol
            FROM usuario u
            JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
            JOIN roles r ON ur.id_rol = r.id_rol
            WHERE u.usuario = %s
        """, (usuario,))

        return cursor.fetchone()

