from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from db import get_db,  MENSAJE_ERROR_CONEXION, Error
from mysql.connector import Error
from security.jsonwebtoken import (generar_token, get_jwt, 
                                   jwt_required, token_blacklist, TOKEN_REFRESH_ROUTE, unset_jwt_cookies)
from service.auth_service import login_usuario

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# ---------------------------------------------------
# LOGIN, LOGOUT
# ---------------------------------------------------


@auth_bp.post("/login")
def autenticar():

    data = request.form

    usuario = login_usuario(data)

    response = jsonify({"ok": True})

    return generar_token(
        response,
        usuario["usuario"],
        usuario["rol"]
    ), 201


@auth_bp.delete("/logout")
@jwt_required()
def cerrar_sesion():
    res = jsonify({"ok": True})
    token_blacklist.add(get_jwt()["jti"])
    unset_jwt_cookies(res)
    return res, 200

# ---------------------------------------------------
# VALIDA SI USUARIO ESTA LOGUEADO
# ---------------------------------------------------

@auth_bp.get("/check")
@jwt_required()
def check_auth():
    return jsonify({"logged": True}), 200

