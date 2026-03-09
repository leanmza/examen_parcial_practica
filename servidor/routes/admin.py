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
            
    # Edito la contraseña del usuario logueado


# @user_bp.patch("/password")
# @jwt_required()
# def editar_clave():

#     data = request.form
#     usuario_identity = get_jwt_identity()

#     cambiar_password(data, usuario_identity)

#     token_blacklist.add(get_jwt()["jti"])

#     claims = get_jwt()
#     rol = claims["rol"]

#     response = jsonify({"ok": True})

#     return generar_token(response, usuario_identity, rol), 200

# # Guardo un usuario nuevo en la BD


# @user_bp.post("/signup")
# def registrar():

#     data = request.form

#     usuario = registrar_usuario(data)

#     return jsonify({
#         "ok": True,
#         "usuario": usuario
#     }), 201

# # ---------------------------------------------------
# # GET USUARIO
# # ---------------------------------------------------

# #  Veo si hay una sesión activa al cargar la web
# #  Muestro el perfil con datos reales


# @user_bp.get("/me")
# @jwt_required(optional=True)
# def me():

#     identity = get_jwt_identity()

#     if not identity:
#         return jsonify({"logged": False}), 200

#     claims = get_jwt()

#     usuario = obtener_usuario(identity)

#     return jsonify({
#         "logged": True,
#         "rol": claims["rol"],
#         "usuario": usuario
#     }), 200
