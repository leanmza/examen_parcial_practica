from repository.user_repository import *
import bcrypt


def obtener_usuario(identity):

    usuario = obtener_usuario_logueado_y_rol(identity)

    if not usuario:
        return None

    return usuario

def registrar_usuario(data):

    if not data:
        raise ValueError("Datos inválidos")

    required_fields = [
        "usuario", "nombre", "apellido",
        "dni", "telefono", "email",
        "nacimiento", "password"
    ]

    if not all(field in data for field in required_fields):
        raise ValueError("Campos incompletos")

    pwd_hash = bcrypt.hashpw(
        data["password"].encode(),
        bcrypt.gensalt()
    ).decode()

    id_usuario = save_usuario(data, pwd_hash)

    id_rol = get_id_role("user")

    asignar_rol(id_usuario, id_rol)

    return obtener_usuario_por_id(id_usuario)

def actualizar_usuario(data, usuario_identity):

    if not data:
        raise ValueError("Datos inválidos")

    update_usuario(data, usuario_identity)

    return obtener_usuario_por_username(usuario_identity)

def cambiar_password(data, usuario_identity):

    password_actual = data.get("password")
    clave_nueva = data.get("clave_nueva")

    if not password_actual or not clave_nueva:
        raise ValueError("Datos incompletos")

    usuario_db = obtener_password_hash(usuario_identity)

    if not usuario_db:
        raise ValueError("Usuario no encontrado")

    if not bcrypt.checkpw(
        password_actual.encode(),
        usuario_db["password"].encode()
    ):
        raise ValueError("Contraseña incorrecta")

    pwd_hash = bcrypt.hashpw(
        clave_nueva.encode(),
        bcrypt.gensalt()
    ).decode()

    actualizar_password(usuario_identity, pwd_hash)