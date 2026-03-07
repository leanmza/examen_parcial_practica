from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db,  MENSAJE_ERROR_CONEXION, MENSAJE_ERROR_UNIQUE, IntegrityError, Error
from mysql.connector import Error
from jsonwebtoken import (get_jwt_identity, jwt_required, 
                          token_blacklist, TOKEN_REFRESH_ROUTE)
from service.torneo_service import (obtener_torneos, inscribir_usuario,
                                    baja_usuario_torneo, obtener_torneos_usuario,
                                    obtener_inscriptos)

torneo_bp = Blueprint("torneos", __name__, url_prefix="/torneos")

# ---------------------------------------------------
# GET TORNEOS
# ---------------------------------------------------

# Trigo todos los torneos con las sedes
@torneo_bp.get("/")
def get_all_torneos():
    try:
        torneos = obtener_torneos()
        return jsonify(torneos), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------
# POST USUARIO EN TORNEO
# ---------------------------------------------------

# Inscribo a un usuario en un torneo
@torneo_bp.post("/usuario-registro")
@jwt_required()
def insert_jugador():
    try:
        identity = get_jwt_identity()
        resultado = inscribir_usuario(identity, request.form)
        return jsonify(resultado), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------
# DELETE USUARIO EN TORNEO
# ---------------------------------------------------

# Elimino un usuario de un torneo
@torneo_bp.delete("/baja-usuario")
@jwt_required()
def baja_usuario():
    try:
        identity = get_jwt_identity()
        data = request.get_json()

        resultado = baja_usuario_torneo(identity, data)
        return jsonify(resultado), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
# ---------------------------------------------------
# GET TORNEOS INSCRIPTOS POR USUARIO
# ---------------------------------------------------

# Trigo los torneos donde esta inscripto el usuario logueado

@torneo_bp.get("/user")
@jwt_required()
def get_torneos_usuario():
    try:
        identity = get_jwt_identity()
        torneos = obtener_torneos_usuario(identity)
        return jsonify(torneos), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@torneo_bp.get("/inscriptos")
@jwt_required()
def get_inscriptos_por_torneo():
    try:
        id_torneo = request.args.get("id_torneo")

        if not id_torneo:
            return jsonify({"error": "Falta id_torneo"}), 400

        inscriptos = obtener_inscriptos(id_torneo)

        return jsonify(inscriptos), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
