from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db,  MENSAJE_ERROR_CONEXION, MENSAJE_ERROR_UNIQUE, IntegrityError, Error
from mysql.connector import Error
from jsonwebtoken import ( generar_token, get_jwt, get_jwt_identity,
                          jwt_required, token_blacklist, TOKEN_REFRESH_ROUTE)
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

    try:
        db = get_db()
    except Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor(dictionary=True)

        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        usuario_identity = get_jwt_identity()
      
        #  Actualizar datos
        cursor.execute("""
            UPDATE usuario
            SET nombre=%s,
                apellido=%s,
                dni=%s,
                telefono=%s,
                email=%s,
                nacimiento=%s
            WHERE usuario=%s
        """, (
            data["nombre"],
            data["apellido"],
            data["dni"],
            data["telefono"],
            data["email"],
            data["nacimiento"],
            usuario_identity
        ))

        db.commit()

        # 🔄 Obtener datos actualizados
        cursor.execute("""
            SELECT id_usuario, usuario, nombre, apellido, dni,
                   telefono, email, nacimiento, foto
            FROM usuario
            WHERE usuario=%s
        """, (usuario_identity,))

        usuario_actualizado = cursor.fetchone()

        # 🔁 Regenerar token con nuevos claims
        response = jsonify({
            "ok": True,
            "usuario": usuario_actualizado
        })

        return generar_token(response, usuario_identity, usuario_actualizado), 200

    except IntegrityError:
        db.rollback()
        return jsonify({"error": MENSAJE_ERROR_UNIQUE}), 400

    except Error as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()

# Edito la contraseña del usuario logueado
@user_bp.patch("/password")
@jwt_required()
def editar_clave():

    try:
        db = get_db()
    except Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor(dictionary=True)

        usuario_identity = get_jwt_identity()
        password_actual = request.form.get("password")
        clave_nueva = request.form.get("clave_nueva")

        if not password_actual or not clave_nueva:
            return jsonify({"error": "Datos incompletos"}), 400

        # 🔐 Obtener hash actual
        cursor.execute(QUERY_HASHED_PWD, [usuario_identity])
        usuario_db = cursor.fetchone()

        if not usuario_db or not bcrypt.checkpw(
            password_actual.encode(),
            usuario_db["password"].encode()
        ):
            return jsonify({"error": "Contraseña incorrecta."}), 403

        # 🔄 Generar nuevo hash
        pwd_hash = bcrypt.hashpw(clave_nueva.encode(), bcrypt.gensalt())

        cursor.execute(
            "UPDATE usuario SET password=%s WHERE usuario=%s;",
            [pwd_hash, usuario_identity]
        )

        db.commit()

        # 🔁 Regenerar token actualizado
        cursor.execute(QUERY_PRE_TOKEN, [usuario_identity])
        fila = cursor.fetchone()

        response = jsonify({"ok": True})
        return generar_token(response, usuario_identity, fila), 200

    except Error as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()

# Guardo un usuario nuevo en la BD
@user_bp.post("/signup")
def registrar():

    try:
        db = get_db()
    except Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor(dictionary=True)

        data = request.form

        if not data:
            return jsonify({"error": "Datos inválidos"}), 400

        # Validación básica
        required_fields = [
            "usuario", "nombre", "apellido",
            "dni", "telefono", "email",
            "nacimiento", "password"
        ]

        if not all(field in data for field in required_fields):
            return jsonify({"error": "Campos incompletos"}), 400

        # 🔐 Hash contraseña
        pwd_hash = bcrypt.hashpw(
            data["password"].encode(),
            bcrypt.gensalt()
        ).decode()

        # 📝 Insertar usuario
        cursor.execute("""
            INSERT INTO usuario
            (usuario, nombre, apellido, dni, telefono, email, nacimiento, password)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s);
        """, (
            data["usuario"],
            data["nombre"],
            data["apellido"],
            data["dni"],
            data["telefono"],
            data["email"],
            data["nacimiento"],
            pwd_hash
        ))

        db.commit()

        # 🔎 Obtener usuario creado
        cursor.execute("""
            SELECT id_usuario, usuario, nombre, apellido, dni,
                   telefono, email, nacimiento, foto
            FROM usuario
            WHERE usuario = %s
        """, (data["usuario"],))

        usuario = cursor.fetchone()

        return jsonify({
            "ok": True,
            "usuario": usuario
        }), 201

    except IntegrityError:
        db.rollback()
        return jsonify({"error": MENSAJE_ERROR_UNIQUE}), 400

    except Error as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()

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

    try:
        db = get_db()
    except Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT id_usuario, usuario, nombre, apellido,
                   dni, telefono, email, nacimiento, foto
            FROM usuario
            WHERE usuario = %s
        """, (identity,))

        usuario = cursor.fetchone()

        return jsonify({
            "logged": True,
            "usuario": usuario
        }), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()

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
