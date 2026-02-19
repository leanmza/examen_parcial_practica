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
# USER - REGISTRO, LOGIN, LOGOUT
# ---------------------------------------------------


@app.post("/login")
def autenticar():

    try:
        db = get_db()
    except mysql.connector.Error:
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

    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()


@app.get("/user")
@jwt_required()  # access token
def get_usuario():
    return jsonify(get_jwt())


@app.put("/user")
@jwt_required()
def editar_usuario():

    try:
        db = get_db()
    except mysql.connector.Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor(dictionary=True)

        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        usuario_identity = get_jwt_identity()

        # 🔐 Verificar contraseña actual
        cursor.execute(QUERY_HASHED_PWD, (usuario_identity,))
        usuario_db = cursor.fetchone()

        if not usuario_db or not bcrypt.checkpw(
            data["password"].encode(),
            usuario_db["password"].encode()
        ):
            return jsonify({"error": "Contraseña incorrecta"}), 403

        # ✏ Actualizar datos
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

    except mysql.connector.Error as e:
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
    except mysql.connector.Error:
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

    except mysql.connector.Error as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()


@app.patch("/user/photo")
@jwt_required()
def editar_foto():

    try:
        db = get_db()
    except mysql.connector.Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor(dictionary=True)

        usuario_identity = get_jwt_identity()

        # 📸 Si viene archivo
        if "foto" in request.files and request.files["foto"].filename:

            archivo = request.files["foto"]
            carpeta_usuario = os.path.join(app.static_folder, usuario_identity)
            os.makedirs(carpeta_usuario, exist_ok=True)

            ruta_archivo = os.path.join(carpeta_usuario, archivo.filename)

            with open(ruta_archivo, "wb") as img:
                bytes_escritos = img.write(archivo.read())

            if bytes_escritos <= 0:
                return jsonify({"error": "Error al almacenar archivo."}), 500

            url = f"http://127.0.0.1:5000/static/{usuario_identity}/{archivo.filename}"

            cursor.execute(
                "UPDATE usuario SET foto=%s WHERE usuario=%s;",
                [url, usuario_identity]
            )

        else:
            # 🗑 Si no viene archivo → borrar foto
            cursor.execute(
                "UPDATE usuario SET foto=NULL WHERE usuario=%s;",
                [usuario_identity]
            )

        db.commit()

        # 🔄 Consultar usuario actualizado
        cursor.execute("""
            SELECT id_usuario, usuario, nombre, apellido, dni,
                   telefono, email, nacimiento, foto
            FROM usuario
            WHERE usuario=%s
        """, (usuario_identity,))

        usuario_actualizado = cursor.fetchone()

        response = jsonify({
            "ok": True,
            "usuario": usuario_actualizado
        })

        return generar_token(response, usuario_identity, usuario_actualizado), 200

    except mysql.connector.Error as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()


def post_consultar_foto():
    db.commit()
    if get_jwt()["foto"] and os.path.exists(f"{app.static_folder}/{get_jwt_identity()}/{request.files['foto'].filename}"):
        os.remove(
            f"{app.static_folder}/{get_jwt_identity()}/{os.path.basename(get_jwt()['foto'])}")
    cursor.execute(QUERY_PRE_TOKEN, [get_jwt()["usuario"]])
    return generar_token(jsonify({"ok": True}), get_jwt_identity(), cursor.fetchone()), 200


@app.delete("/logout")
@jwt_required()
def cerrar_sesion():
    res = jsonify({"ok": True})
    token_blacklist.add(get_jwt()["jti"])
    unset_jwt_cookies(res)
    return res, 200


@app.post("/user/signup")
def registrar():

    try:
        db = get_db()
    except mysql.connector.Error:
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

    except mysql.connector.Error as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()


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
# GET USUARIO
# ---------------------------------------------------


@app.get("/torneos/validar-usuario")
def get_jugador_por_dni():

    dni = request.args.get("dni")

    if not dni:
        return jsonify({"id_usuario": None}), 200

    try:
        db = get_db()
    except mysql.connector.Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT id_usuario
            FROM usuario
            WHERE dni = %s
        """, (dni,))

        row = cursor.fetchone()

        if row is None:
            return jsonify({"id_usuario": None}), 200

        return jsonify({"id_usuario": row["id_usuario"]}), 200

    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()


# ---------------------------------------------------
# GET USUARIO-TORNEO
# ---------------------------------------------------


@app.get("/torneos/validar-inscripcion")
def validar_inscripcion():

    dni = request.args.get("dni")
    id_torneo = request.args.get("id_torneo")

    if not dni or not id_torneo:
        return jsonify({"existe": False}), 200

    try:
        db = get_db()
    except mysql.connector.Error:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    try:
        cursor = db.cursor()

        cursor.execute("""
            SELECT 1
            FROM jugadores_torneos jt
            JOIN usuario j ON jt.id_usuario = j.id_usuario
            WHERE jt.id_torneo = %s
            AND j.dni = %s
            LIMIT 1
        """, (id_torneo, dni))

        existe = cursor.fetchone() is not None

        return jsonify({"existe": existe}), 200

    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()

# ---------------------------------------------------
# GET TORNEOS
# ---------------------------------------------------


# @app.get("/torneos")
# def get_all_torneos():
#     cursor = db.cursor(dictionary=True)
#     if not cursor:
#         return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

#     cursor.execute("""
#         SELECT
#             t.id_torneo,
#             t.fecha,
#             s.id_sede,
#             s.nombre,
#             s.direccion,
#             s.ciudad
#         FROM torneos t
#         JOIN sedes s ON t.id_sede = s.id_sede
#     """)

#     filas = cursor.fetchall()

#     torneos = []
#     for f in filas:
#         torneos.append({
#             "id_torneo": f["id_torneo"],
#             "fecha": f["fecha"].isoformat(),
#             "sede": {
#                 "id_sede": f["id_sede"],
#                 "nombre": f["nombre"],
#                 "direccion": f["direccion"],
#                 "ciudad": f["ciudad"]
#             }
#         })

#     return jsonify(torneos), 200

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
# POST USUARIO / TORNEO CON USUARIO NUEVO
# ---------------------------------------------------
@app.post("/torneos/usuario-registro")
def insert_jugador():

    # Validar campos mínimos
    required_fields = [
        "id_usuario", "id_torneo",
        "identificador", "fecha_inscripcion"
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

  
        # 2️⃣ Relacionar con torneo
        cursor.execute("""
            INSERT INTO jugadores_torneos
            (id_usuario, id_torneo, identificador, fecha_inscripcion)
            VALUES (%s, %s, %s, %s)
        """, (
            request.form["id_usuario"],
            request.form["id_torneo"],
            request.form["identificador"],
            request.form["fecha_inscripcion"],
        ))

        db.commit()

        return jsonify({
            "ok": True,
            
        }), 201

    except Error as e:
        db.rollback()
        return jsonify({
            "error": str(e)
        }), 500

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
# MAIN
# ---------------------------------------------------
if __name__ == "__main__":
    print("Servidor corriendo en http://127.0.0.1:5000")
    serve(app, host="127.0.0.1", port=5000)
