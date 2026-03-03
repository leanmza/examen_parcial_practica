from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db,  MENSAJE_ERROR_CONEXION, Error
from mysql.connector import Error
from jsonwebtoken import (configurar_jwt, generar_token, get_jwt, get_jwt_identity,
                          jwt_required, token_blacklist, TOKEN_REFRESH_ROUTE, unset_jwt_cookies)
import bcrypt

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

QUERY_HASHED_PWD = "SELECT password FROM usuario WHERE usuario=%s;"
QUERY_PRE_TOKEN = "SELECT foto, email, nombre, usuario FROM usuario WHERE usuario=%s;"

# ---------------------------------------------------
# LOGIN, LOGOUT
# ---------------------------------------------------


@auth_bp.post("/login")
def autenticar():

    try:
        db = get_db()
    except Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor(dictionary=True)

        # Busca al usuario y la contraseña hasheada
        cursor.execute(QUERY_HASHED_PWD, [request.form["usuario"]])
        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

        # Verifica la contraseña
        if not bcrypt.checkpw(
            request.form["password"].encode(),
            usuario["password"].encode()
        ):
            return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

        # Obtenengo los datos para el token
        cursor.execute(QUERY_PRE_TOKEN, [request.form["usuario"]])
        fila = cursor.fetchone()

        response = jsonify({"ok": True})
        return generar_token(response, fila["usuario"], fila), 201

    except Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()


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

