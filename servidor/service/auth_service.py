import bcrypt
from repository.user_repository import (
    obtener_password_hash,
    obtener_usuario_con_rol
)

def login_usuario(data):

    if not data:
        raise ValueError("Datos inválidos")

    required_fields = [
        "usuario", "password"
    ]

    if not all(field in data for field in required_fields):
        raise ValueError("Campos obligatorio")

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