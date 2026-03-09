from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from mysql.connector import Error
from security.jsonwebtoken import (generar_token, get_jwt, get_jwt_identity,
                                   jwt_required, token_blacklist)
from service.user_service import *

user_bp = Blueprint("user", __name__, url_prefix="/user")

# Verifico que el usuario esté autenticado y devuelvo los datos guardados dentro del token JWT.
@user_bp.get("/")
@jwt_required()  # access token
def get_usuario():
    return jsonify(get_jwt())

# Edito los datos del usuario


@user_bp.put("/")
@jwt_required()
def editar_usuario():

        data = request.get_json()
   
        usuario_identity = get_jwt_identity()

        usuario_actualizado = actualizar_usuario(data, usuario_identity)
        
        response = jsonify({
            "ok": True,
            "usuario": usuario_actualizado
        })

        return generar_token(response, usuario_identity, usuario_actualizado), 200


# Edito la contraseña del usuario logueado


@user_bp.patch("/password")
@jwt_required()
def editar_clave():

    data = request.form
    usuario_identity = get_jwt_identity()

    cambiar_password(data, usuario_identity)
    
    token_blacklist.add(get_jwt()["jti"])
    
    claims = get_jwt()
    rol = claims["rol"]

    response = jsonify({"ok": True})
    


    return generar_token(response, usuario_identity, rol), 200

# Guardo un usuario nuevo en la BD


@user_bp.post("/signup")
def registrar():

    data = request.form

    usuario = registrar_usuario(data)

    return jsonify({
        "ok": True,
        "usuario": usuario
    }), 201

# ---------------------------------------------------
# GET USUARIO
# ---------------------------------------------------

#  Veo si hay una sesión activa al cargar la web
#  Muestro el perfil con datos reales
@user_bp.get("/me")
@jwt_required(optional=True)
def me():

    identity = get_jwt_identity()

    if not identity:
        return jsonify({"logged": False}), 200

    claims = get_jwt()

    usuario = obtener_usuario(identity)

    return jsonify({
        "logged": True,
        "rol": claims["rol"],
        "usuario": usuario
    }), 200

