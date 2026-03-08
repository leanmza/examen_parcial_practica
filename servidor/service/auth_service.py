import bcrypt
from repository.user_repository import (
    obtener_password_hash,
    obtener_usuario_con_rol
)
from utils.validators import validate_fields

def login_usuario(data):

    validate_fields(data, [
        "usuario",
        "password"
    ])
    

    usuario_db = obtener_password_hash(data["usuario"])

    if not usuario_db:
        raise ValueError("Usuario o contraseña incorrectos")

    if not bcrypt.checkpw(
        data["password"].encode(),
        usuario_db["password"].encode()
    ):
        raise ValueError("Usuario o contraseña incorrectos")

    usuario = obtener_usuario_con_rol(data["usuario"])

    if not usuario:
        raise ValueError("Usuario no encontrado")

    return usuario