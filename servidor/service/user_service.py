from repository.user_repository import *
from utils.validators import validate_fields
import bcrypt


def obtener_usuario(identity):

    usuario = obtener_usuario_logueado_y_rol(identity)

    if not usuario:
        return None

    return usuario

def registrar_usuario(data):

    validate_fields(data, ["usuario",
                           "nombre",
                           "apellido",
                           "dni",
                           "telefono",
                           "email",
                           "nacimiento",
                           "password"
    ])

    pwd_hash = bcrypt.hashpw(
        data["password"].encode(),
        bcrypt.gensalt()
    ).decode()

    id_usuario = save_usuario(data, pwd_hash)

    id_rol = get_id_role("user")

    asignar_rol(id_usuario, id_rol)

    return obtener_usuario_por_id(id_usuario)

def actualizar_usuario(data, usuario_identity):

    validate_fields(data, ["nombre",
                           "apellido",
                           "telefono",
                           "email",
                           "nacimiento"
                           ])

    update_usuario(data, usuario_identity)

    return obtener_usuario_por_username(usuario_identity)

def cambiar_password(data, usuario_identity):



    validate_fields(data, ["password",
                           "clave_nueva",
    ])
    
    password_actual = data.get("password")
    clave_nueva = data.get("clave_nueva")

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