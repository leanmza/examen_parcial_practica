from repository.contacto_repository import save_mensaje
from utils.validators import validate_fields

def guardar_mensaje(data):

    validate_fields(data, [
        "nombre",
        "apellido",
        "email",
        "motivo",
        "mensaje"
    ])

    save_mensaje(data)