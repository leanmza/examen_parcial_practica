from flask import Blueprint, request, jsonify
from db import Error
from mysql.connector import Error
from service.sede_service import (obtener_sedes, registrar_sede, actualizar_sede, baja_sede)
from security.roles import role_required, ADMIN

sede_bp = Blueprint("sedes", __name__, url_prefix="/sedes")

@sede_bp.get("")
@role_required(ADMIN)
def get_all_sedes():
    try:
        sedes = obtener_sedes()
        return jsonify(sedes), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500

@sede_bp.post("")
@role_required(ADMIN)
def insertar_sede():
    try:
        data = request.form

        sede = registrar_sede(data)
        
        return jsonify(sede), 201


    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500    
    
@sede_bp.put("")
@role_required(ADMIN)
def editar_sede():
    try:
        data = request.form
        
        sede = actualizar_sede(data)
        
        return jsonify(sede), 201


    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500     
    
@sede_bp.delete("")
@role_required(ADMIN)
def eliminar_sede():
    try:
        data = request.get_json()
        
        resultado = baja_sede(data)
        
        return jsonify(resultado), 200
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500