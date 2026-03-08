def validate_fields(data, required_fields):

    if not data:
        raise ValueError("No se enviaron datos")

    missing = []

    for field in required_fields:
        if not data.get(field):
            missing.append(field)

    if missing:
        raise ValueError({
            "error": "Campos faltantes",
            "fields": missing
        })

    return True