from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db,  MENSAJE_ERROR_CONEXION, MENSAJE_ERROR_UNIQUE, IntegrityError, Error
from mysql.connector import Error
from security.jsonwebtoken import (generar_token, get_jwt, get_jwt_identity,
                                   jwt_required, token_blacklist, TOKEN_REFRESH_ROUTE)
from service.user_service import *
import bcrypt

user_bp = Blueprint("user", __name__, url_prefix="/user")


QUERY_HASHED_PWD = "SELECT password FROM usuario WHERE usuario=%s;"
QUERY_PRE_TOKEN = "SELECT foto, email, nombre, usuario FROM usuario WHERE usuario=%s;"


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

# @user_bp.get("/me")
# @jwt_required(optional=True)
# def me():

#     identity = get_jwt_identity()

#     if not identity:
#         return jsonify({"logged": False}), 200

#     usuario = obtener_usuario(identity)

#     return jsonify({
#             "logged": True,
#             "usuario": usuario
#         }), 200


# @user_bp.patch("/photo")
# @jwt_required()
# def editar_foto():

#     try:
#         db = get_db()
#     except Error:
#         return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

#     try:
#         cursor = db.cursor(dictionary=True)

#         usuario_identity = get_jwt_identity()

#         #  Si viene archivo
#         if "foto" in request.files and request.files["foto"].filename:

#             archivo = request.files["foto"]
#             carpeta_usuario = os.path.join(app.static_folder, usuario_identity)
#             os.makedirs(carpeta_usuario, exist_ok=True)

#             ruta_archivo = os.path.join(carpeta_usuario, archivo.filename)

#             with open(ruta_archivo, "wb") as img:
#                 bytes_escritos = img.write(archivo.read())

#             if bytes_escritos <= 0:
#                 return jsonify({"error": "Error al almacenar archivo."}), 500

#             url = f"http://127.0.0.1:5000/static/{usuario_identity}/{archivo.filename}"

#             cursor.execute(
#                 "UPDATE usuario SET foto=%s WHERE usuario=%s;",
#                 [url, usuario_identity]
#             )

#         else:
#             # 🗑 Si no viene archivo → borrar foto
#             cursor.execute(
#                 "UPDATE usuario SET foto=NULL WHERE usuario=%s;",
#                 [usuario_identity]
#             )

#         db.commit()

#         #  Consultar usuario actualizado
#         cursor.execute("""
#             SELECT id_usuario, usuario, nombre, apellido, dni,
#                    telefono, email, nacimiento, foto
#             FROM usuario
#             WHERE usuario=%s
#         """, (usuario_identity,))

#         usuario_actualizado = cursor.fetchone()

#         response = jsonify({
#             "ok": True,
#             "usuario": usuario_actualizado
#         })

#         return generar_token(response, usuario_identity, usuario_actualizado), 200

#     except Error as e:
#         db.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cursor.close()
#         db.close()


# def post_consultar_foto():
#     try:
#         db = get_db()
#     except Error:
#         return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500
#     try:
#         cursor = db.cursor(dictionary=True)
#         if get_jwt()["foto"] and os.path.exists(f"{app.static_folder}/{get_jwt_identity()}/{request.files['foto'].filename}"):
#             os.remove(
#                 f"{app.static_folder}/{get_jwt_identity()}/{os.path.basename(get_jwt()['foto'])}")
#         cursor.execute(QUERY_PRE_TOKEN, [get_jwt()["usuario"]])
#         return generar_token(jsonify({"ok": True}), get_jwt_identity(), cursor.fetchone()), 200

#     except Error as e:
#         db.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cursor.close()
#         db.close()
