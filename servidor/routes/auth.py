from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from security.jsonwebtoken import (generar_token, get_jwt, get_jwt_identity,
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

    recordar = data.get("recordar") == "true"

    response = jsonify({"ok": True})

    return generar_token(
        response,
        usuario["usuario"],
        usuario["rol"],
        recordar
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

@auth_bp.post(TOKEN_REFRESH_ROUTE)
@jwt_required(refresh=True)
def refresh_token():

    claims = get_jwt()
    rol = claims["rol"]

    # invalidar refresh usado
    token_blacklist.add(claims["jti"])

    return generar_token(
        jsonify({"ok": True}),
        get_jwt_identity(),
        rol
    ), 201