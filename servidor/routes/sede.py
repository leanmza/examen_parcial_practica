from flask import Blueprint, request, jsonify
from db import Error
from mysql.connector import Error
from service.sede_service import (obtener_sedes)
from security.roles import role_required, ADMIN

sede_bp = Blueprint("sedes", __name__, url_prefix="/sedes")

@sede_bp.get("")
@role_required(ADMIN)
def get_all_sedes():
    try:
        torneos = obtener_sedes()
        return jsonify(torneos), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500

