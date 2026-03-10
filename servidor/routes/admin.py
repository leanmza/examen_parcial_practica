from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import Error
from security.jsonwebtoken import (generar_token, get_jwt, get_jwt_identity,
                                   jwt_required, token_blacklist)
from service.admin_service import *
from security.roles import role_required, ADMIN, USER
from service.admin_service import registrar_torneo, actualizar_torneo, baja_torneo

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

# Edito los datos del usuario


@admin_bp.post("/torneo")
@role_required(ADMIN)
def insertar_torneo():
    try:
        data = request.form

        torneo = registrar_torneo(data)
        
        return jsonify(torneo), 201


    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500    
    
@admin_bp.put("/torneo")
@role_required(ADMIN)
def editar_torneo():
    try:
        data = request.form
        
        torneo = actualizar_torneo(data)
        
        return jsonify(torneo), 201


    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500     
    
@admin_bp.delete("/torneo")
@role_required(ADMIN)
def eliminar_torneo():
    try:
        data = request.get_json()
        
        resultado = baja_torneo(data)
        
        return jsonify(resultado), 200
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
            
@admin_bp.delete("/baja-usuario")
@role_required(ADMIN)
def baja_usuario_admin():
    try:
        data = request.get_json()

        id_usuario = data.get("id_usuario")
        id_torneo = data.get("id_torneo")

        if not id_usuario or not id_torneo:
            return jsonify({"error": "Faltan datos"}), 400

        resultado = baja_usuario_torneo(data)

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500