from flask import Blueprint, request, jsonify
from service.contacto_service import guardar_mensaje

contacto_bp = Blueprint("contacto", __name__, url_prefix="/contacto")

# ---------------------------------------------------
# POST CONTACTO
# ---------------------------------------------------

# Guardo los mensajes 
@contacto_bp.post("/")
def enviar_mensaje():

    try:
        data = request.form

        guardar_mensaje(data)

        return jsonify({
            "ok": True
        }), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400