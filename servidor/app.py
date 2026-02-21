from flask import request, jsonify
from db import get_db,  MENSAJE_ERROR_CONEXION, MENSAJE_ERROR_UNIQUE, IntegrityError, Error
from flask import Flask, jsonify, Response, request
from flask_cors import CORS
from logger import logger
from waitress import serve
from jsonwebtoken import (configurar_jwt, generar_token, get_jwt, get_jwt_identity,
                          jwt_required, token_blacklist, TOKEN_REFRESH_ROUTE, unset_jwt_cookies)
import bcrypt
import os

QUERY_HASHED_PWD = "SELECT password FROM usuario WHERE usuario=%s;"
QUERY_PRE_TOKEN = "SELECT foto, email, nombre, usuario FROM usuario WHERE usuario=%s;"

app = Flask("gente-server",
            static_folder=__file__.replace(f"servidor{os.sep}app.py", "static"))

CORS(app,
     supports_credentials=True,
     origins=["http://127.0.0.1:5500"])


# ---------------------------------------------------
# CONFIG JWT
# ---------------------------------------------------
jwt = configurar_jwt(app)


@jwt.token_in_blocklist_loader
def check_if_token_revoked(_, jwt_payload):  # jwt_header ignorado
    return jwt_payload['jti'] in token_blacklist


@app.post(TOKEN_REFRESH_ROUTE)
@jwt_required(refresh=True)
def refresh_token():
    return generar_token(jsonify({"ok": True}), get_jwt_identity(), get_jwt()), 201


@app.after_request
def anotar_salida(response):
    logger.info(
        f"{request.method} {request.path} {response.mimetype} {response.status}")
    return response

# ---------------------------------------------------
# LOGIN, LOGOUT
# ---------------------------------------------------


@app.post("/login")
def autenticar():

    try:
        db = get_db()
    except Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor(dictionary=True)

        # Buscar usuario y hash
        cursor.execute(QUERY_HASHED_PWD, [request.form["usuario"]])
        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

        # Verificar contraseña
        if not bcrypt.checkpw(
            request.form["password"].encode(),
            usuario["password"].encode()
        ):
            return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

        # Obtener datos para el token
        cursor.execute(QUERY_PRE_TOKEN, [request.form["usuario"]])
        fila = cursor.fetchone()

        response = jsonify({"ok": True})
        return generar_token(response, fila["usuario"], fila), 201

    except Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()


@app.delete("/logout")
@jwt_required()
def cerrar_sesion():
    res = jsonify({"ok": True})
    token_blacklist.add(get_jwt()["jti"])
    unset_jwt_cookies(res)
    return res, 200

# ---------------------------------------------------
# USER - POST, PUT, GET
# ---------------------------------------------------


@app.get("/user")
@jwt_required()  # access token
def get_usuario():
    return jsonify(get_jwt())


@app.put("/user")
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


@app.patch("/user/password")
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


# @app.patch("/user/photo")
# @jwt_required()
# def editar_foto():

#     try:
#         db = get_db()
#     except Error:
#         return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

#     try:
#         cursor = db.cursor(dictionary=True)

#         usuario_identity = get_jwt_identity()

#         # 📸 Si viene archivo
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

#         # 🔄 Consultar usuario actualizado
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


@app.post("/user/signup")
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


@app.get("/user/me")
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

# ---------------------------------------------------
# GET USUARIO-TORNEO
# ---------------------------------------------------


@app.get("/torneos/validar-inscripcion")
@jwt_required(optional=True)
def validar_inscripcion():

    dni = request.args.get("dni")
    id_torneo = request.args.get("id_torneo")

    if not dni or not id_torneo:
        return jsonify({"existe": False}), 200

    try:
        db = get_db()
    except Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor()

        cursor.execute("""
            SELECT 1
            FROM usuarios_torneos jt
            JOIN usuario j ON jt.id_usuario = j.id_usuario
            WHERE jt.id_torneo = %s
            AND j.dni = %s
            LIMIT 1
        """, (id_torneo, dni))

        existe = cursor.fetchone() is not None

        return jsonify({"existe": existe}), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()

# ---------------------------------------------------
# GET TORNEOS
# ---------------------------------------------------


@app.get("/torneos")
def get_all_torneos():
    try:
        db = get_db()
    except Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                t.id_torneo,
                t.fecha,
                s.id_sede,
                s.nombre AS sede_nombre,
                s.ciudad AS sede_ciudad
            FROM torneos t
            JOIN sedes s ON t.id_sede = s.id_sede
        """)

        rows = cursor.fetchall()

        torneos = []
        for row in rows:
            fecha_formateada = row["fecha"].strftime("%d-%m-%Y")

            torneos.append({
                "id_torneo": row["id_torneo"],
                "fecha": fecha_formateada,
                "sede": {
                    "id_sede": row["id_sede"],
                    "nombre": row["sede_nombre"],
                    "ciudad": row["sede_ciudad"]
                }
            })

        return jsonify(torneos), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()

# ---------------------------------------------------
# POST USUARIO EN TORNEO
# ---------------------------------------------------


@app.post("/torneos/usuario-registro")
@jwt_required()
def insert_jugador():

    identity = get_jwt_identity()

    # Validar campos mínimos
    required_fields = [
        "id_torneo",
        "identificador",
        "fecha_inscripcion"
    ]

    for field in required_fields:
        if field not in request.form:
            return jsonify({"error": f"Falta el campo {field}"}), 400

    try:
        db = get_db()
    except Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor(dictionary=True)

        #  Obtener id_usuario real desde el token
        cursor.execute("""
            SELECT id_usuario
            FROM usuario
            WHERE usuario = %s
        """, (identity,))

        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        id_usuario = user["id_usuario"]

        #  Verificar si ya está inscripto
        cursor.execute("""
            SELECT 1
            FROM usuarios_torneos
            WHERE id_usuario = %s AND id_torneo = %s
            LIMIT 1
        """, (id_usuario, request.form["id_torneo"]))

        if cursor.fetchone():
            return jsonify({
                "error": "El usuario ya está inscripto en este torneo"
            }), 409

        # Insertar inscripción
        cursor.execute("""
            INSERT INTO usuarios_torneos
            (id_usuario, id_torneo, identificador, fecha_inscripcion)
            VALUES (%s, %s, %s, %s)
        """, (
            id_usuario,
            request.form["id_torneo"],
            request.form["identificador"],
            request.form["fecha_inscripcion"],
        ))

        db.commit()

        return jsonify({
            "ok": True,
            "mensaje": "Inscripción realizada correctamente"
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
# DELETE USUARIO EN TORNEO
# ---------------------------------------------------


@app.delete("/torneos/baja-usuario")
@jwt_required()
def baja_usuario_torneo():

    identity = get_jwt_identity()
    data = request.get_json()

    if not data or "id_torneo" not in data:
        return jsonify({"error": "Falta id_torneo"}), 400

    id_torneo = data["id_torneo"]

    try:
        db = get_db()
    except Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor(dictionary=True)

        # 🔎 Obtener id_usuario real desde username
        cursor.execute("""
            SELECT id_usuario
            FROM usuario
            WHERE usuario = %s
        """, (identity,))

        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        id_usuario = user["id_usuario"]

        # 🗑️ Eliminar inscripción
        cursor.execute("""
            DELETE FROM usuarios_torneos
            WHERE id_usuario = %s AND id_torneo = %s
        """, (id_usuario, id_torneo))

        db.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "ok": False,
                "mensaje": "No se encontró el registro"
            }), 404

        return jsonify({
            "ok": True,
            "mensaje": "Usuario eliminado del torneo"
        }), 200

    except Error as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()
# ---------------------------------------------------
# GET TORNEOS INSCRIPTOS POR USUARIO
# ---------------------------------------------------

@app.get("/user/torneos")
@jwt_required()
def get_all_torneos_inscripto():

    identity = get_jwt_identity()

    try:
        db = get_db()
    except Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor(dictionary=True)

        # Obtener id_usuario real desde username
        cursor.execute("""
            SELECT id_usuario
            FROM usuario
            WHERE usuario = %s
        """, (identity,))

        user = cursor.fetchone()

        if not user:
            return jsonify([]), 200

        id_usuario = user["id_usuario"]

        # Traer torneos donde está inscripto
        cursor.execute("""
            SELECT
                t.id_torneo,
                t.fecha,
                s.nombre AS sede_nombre,
                s.ciudad AS sede_ciudad,
                jt.identificador,
                jt.fecha_inscripcion
            FROM usuarios_torneos jt
            JOIN torneos t ON jt.id_torneo = t.id_torneo
            JOIN sedes s ON t.id_sede = s.id_sede
            WHERE jt.id_usuario = %s
        """, (id_usuario,))

        rows = cursor.fetchall()

        torneos = []
        for row in rows:
            torneos.append({
                "id_torneo": row["id_torneo"],
                "fecha": row["fecha"].strftime("%d-%m-%Y"),
                "sede": {
                    "nombre": row["sede_nombre"],
                    "ciudad": row["sede_ciudad"]
                },
                "identificador": row["identificador"],
                "fecha_inscripcion": row["fecha_inscripcion"].strftime("%d-%m-%Y")
            })

        return jsonify(torneos), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()

# ---------------------------------------------------
# POST CONTACTO
# ---------------------------------------------------

@app.post("/contactoForm/")
def insert_mensaje():

    required_fields = [
        "nombre",
        "apellido",
        "email",
        "motivo",
        "mensaje"
    ]

    for field in required_fields:
        if field not in request.form:
            return jsonify({"error": f"Falta el campo {field}"}), 400

    try:
        db = get_db()
    except Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor()

        cursor.execute("""
            INSERT INTO mensajes
            (nombre, apellido, email, motivo, mensaje)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            request.form["nombre"],
            request.form["apellido"],
            request.form["email"],
            request.form["motivo"],
            request.form["mensaje"]
        ))

        db.commit()

        return jsonify({"ok": True}), 201

    except IntegrityError:
        db.rollback()
        return jsonify({
            "error": "No se pudo enviar el mensaje"
        }), 400

    except Error as e:
        db.rollback()
        return jsonify({
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        db.close()


# ---------------------------------------------------
# VALIDA SI USUARIO ESTA LOGUEADO
# ---------------------------------------------------

@app.get("/auth/check")
@jwt_required()
def check_auth():
    return jsonify({"logged": True}), 200

def get_id_usuario_from_identity(identity, db):
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT id_usuario
        FROM usuario
        WHERE usuario = %s
    """, (identity,))

    user = cursor.fetchone()
    cursor.close()

    if not user:
        return None

    return user["id_usuario"]
# ---------------------------------------------------
# MAIN
# ---------------------------------------------------
if __name__ == "__main__":
    print("Servidor corriendo en http://127.0.0.1:5000")
    serve(app, host="127.0.0.1", port=5000)
