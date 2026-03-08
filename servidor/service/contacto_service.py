from repository.contacto_repository import save_mensaje

def guardar_mensaje(data):

    if not data:
        raise ValueError("Datos inválidos")

    required_fields = [
        "nombre", "apellido",
        "email", "motivo", "mensaje"
    ]

    if not all(field in data for field in required_fields):
        raise ValueError("Campos incompletos")

    save_mensaje(data)