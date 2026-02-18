from db import db, cursor, MENSAJE_ERROR_CONEXION, MENSAJE_ERROR_UNIQUE,  IntegrityError
from flask import Flask, jsonify, Response, request
from flask_cors import CORS
from logger import logger
from waitress import serve
from jsonwebtoken import (configurar_jwt, generar_token, get_jwt, get_jwt_identity,
    jwt_required, token_blacklist, TOKEN_REFRESH_ROUTE, unset_jwt_cookies)
import bcrypt, os

QUERY_HASHED_PWD = "SELECT password FROM usuario WHERE usuario=%s;"
QUERY_PRE_TOKEN = "SELECT foto, email, nombre, usuario FROM usuario WHERE usuario=%s;"

app = Flask("gente-server",
    static_folder=__file__.replace(f"servidor{os.sep}app.py", "static"))
     
CORS(app, supports_credentials=True, resources={
    r"/contactoForm/": {
        "methods": ["POST"],
        "origins": "http://127.0.0.1:5500"
    },
    r"/torneo-usuario-form/": {
        "methods": ["POST"],
        "origins": "http://127.0.0.1:5500"
    },
    r"/torneoForm/": {
        "methods": ["POST"],
        "origins": "http://127.0.0.1:5500"
    },
    r"/torneos/": {
        "methods": ["GET"],
        "origins": "http://127.0.0.1:5500"
    },
    r"/validar-inscripcion": {
        "methods": ["GET"],
        "origins": "http://127.0.0.1:5500"
    },
    r"/validar-usuario": {
        "methods": ["GET"],
        "origins": "http://127.0.0.1:5500"
    },
    r"/user":{
        "methods":["GET","POST", "DELETE", "PUT", "PATCH"],
        "origins":"http://127.0.0.1:5500"
    }
    ,
    r"/user/*":{
        "methods":["GET","POST", "DELETE", "PUT", "PATCH"],
        "origins":"http://127.0.0.1:5500"
    }
})

# ---------------------------------------------------
# CONFIG JWT
# ---------------------------------------------------
jwt = configurar_jwt(app)
@jwt.token_in_blocklist_loader
def check_if_token_revoked(_, jwt_payload): # jwt_header ignorado
    return jwt_payload['jti'] in token_blacklist

@app.post(TOKEN_REFRESH_ROUTE)
@jwt_required(refresh=True)
def refresh_token():
    return generar_token(jsonify({"ok":True}), get_jwt_identity(), get_jwt()), 201

@app.after_request
def anotar_salida(response):
    logger.info(f"{request.method} {request.path} {response.mimetype} {response.status}")
    return response

# ---------------------------------------------------
# USER - REGISTRO, LOGIN, LOGOUT
# ---------------------------------------------------
@app.post("/login")
def autenticar():
    if cursor:
        cursor.execute(QUERY_HASHED_PWD, [request.form["usuario"]])
        USUARIO = cursor.fetchone()
        if USUARIO and bcrypt.checkpw(request.form["password"].encode(), USUARIO["password"].encode()):
                cursor.execute(QUERY_PRE_TOKEN, [request.form["usuario"]])
                FILA = cursor.fetchone()
                retorno = generar_token(jsonify({"ok": True}), FILA["usuario"], FILA), 201
        else:
            retorno = jsonify({"error" : "Usuario o contraseña incorrectos"}), 401
    else:
        retorno = jsonify({"error": MENSAJE_ERROR_CONEXION}), 500
    return retorno

@app.get("/user")
@jwt_required() # access token
def get_usuario():
    return jsonify(get_jwt())

@app.put("/user")
@jwt_required()
def editar_usuario():

    if not cursor:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "JSON inválido"}), 400

    try:
        # Verifica la contraseña actual
        cursor.execute(QUERY_HASHED_PWD, (get_jwt_identity(),))
        usuario_db = cursor.fetchone()

        if not usuario_db or not bcrypt.checkpw(
            data["password"].encode(),
            usuario_db["password"].encode()
        ):
            return jsonify({"error": "Contraseña incorrecta"}), 403

        #  Actualiza datos
        cursor.execute("""
            UPDATE usuario
            SET nombre=%s,
                apellido=%s,
                dni=%s,
                telefono=%s,
                email=%s,
                nacimiento=%s
            WHERE usuario=%s
        """,
        (
            data["nombre"],
            data["apellido"],
            data["dni"],
            data["telefono"],
            data["email"],
            data["nacimiento"],
            get_jwt_identity()
        ))

        db.commit()

        # Consulta usuario actualizado
        cursor.execute("""
            SELECT id_usuario, usuario, nombre, apellido, dni, telefono, email, nacimiento, foto
            FROM usuario
            WHERE usuario=%s
        """, (get_jwt_identity(),))

        usuario_actualizado = cursor.fetchone()

        #  Regenera token con claims actualizados
        response = jsonify({
            "ok": True,
            "usuario": usuario_actualizado
        })

        return generar_token(response, get_jwt_identity(), usuario_actualizado), 200

    except IntegrityError:
        db.rollback()
        return jsonify({"error": MENSAJE_ERROR_UNIQUE}), 400

@app.patch("/user/password")
@jwt_required()
def editar_clave():
    if cursor:
        cursor.execute(QUERY_HASHED_PWD, [get_jwt_identity()])
        USUARIO = cursor.fetchone()
        if USUARIO and bcrypt.checkpw(request.form["password"].encode(), USUARIO["password"].encode()):
            PWD = bcrypt.hashpw(request.form["clave_nueva"].encode(), bcrypt.gensalt())
            cursor.execute("UPDATE usuario SET password=%s WHERE usuario=%s;",
                [PWD, get_jwt_identity()])
            db.commit()
            cursor.execute(QUERY_PRE_TOKEN, [get_jwt()["usuario"]])
            retorno = generar_token(jsonify({"ok": True}), get_jwt_identity(), cursor.fetchone()), 200
        else:
            retorno = jsonify({"error": "Contraseña incorrecta."}), 403
    else:
        retorno = jsonify({"error": MENSAJE_ERROR_CONEXION}), 500
    return retorno

@app.patch("/user/photo")
@jwt_required()
def editar_foto():
    if cursor:
        if "foto" in request.files and request.files["foto"].filename:
            os.makedirs(f"{app.static_folder}/{get_jwt_identity()}", exist_ok=True)
            with open(f"{app.static_folder}/{get_jwt_identity()}/{request.files['foto'].filename}", "wb") as img:
                bytes_escritos = img.write(request.files["foto"].read())
                if bytes_escritos > 0:
                    URL = f"http://127.0.0.1:5000/static/{get_jwt_identity()}/{request.files['foto'].filename}"
                    cursor.execute("UPDATE usuario SET foto=%s WHERE usuario=%s;",
                        [URL, get_jwt_identity()])
                    retorno = post_consultar_foto()        
                else:
                    retorno = jsonify({"error": "Error al almacenar archivo."}), 500
        else:
            cursor.execute("UPDATE usuario SET foto=NULL WHERE usuario=%s;", [get_jwt_identity()])
            retorno = post_consultar_foto()
    else:
        retorno = jsonify({"error": MENSAJE_ERROR_CONEXION}), 500
    return retorno

def post_consultar_foto():
    db.commit()
    if get_jwt()["foto"] and os.path.exists(f"{app.static_folder}/{get_jwt_identity()}/{request.files['foto'].filename}"):
        os.remove(f"{app.static_folder}/{get_jwt_identity()}/{os.path.basename(get_jwt()['foto'])}")
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

    if not cursor:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    data = request.form  

    if not data:
        return jsonify({"error": "JSON inválido"}), 400

    try:
        PWD = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()

        cursor.execute("""
            INSERT INTO usuario
            (usuario, nombre, apellido, dni, telefono, email, nacimiento, password)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s);
        """,
        (
            data["usuario"],
            data["nombre"],
            data["apellido"],
            data["dni"],
            data["telefono"],
            data["email"],
            data["nacimiento"],
            PWD
        ))

        db.commit()
        
        cursor.execute("""
            SELECT id_usuario, usuario, nombre, apellido, dni, telefono, email, nacimiento, foto
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

# ---------------------------------------------------
# GET USUARIO
# ---------------------------------------------------

@app.get("/validar-usuario")
def get_jugador_por_dni():

    dni = request.args.get("dni")

    if not dni:
        return jsonify({"id_usuario": None}), 200

    cursor = db.cursor(dictionary=True)
    if not cursor:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    cursor.execute("""
        SELECT id_usuario
        FROM usuario
        WHERE dni = %s
    """, (dni,))

    row = cursor.fetchone()

    if row is None:
        return jsonify({"id_usuario": None}), 200

    return jsonify({"id_usuario": row["id_usuario"]}), 200


# ---------------------------------------------------
# GET USUARIO-TORNEO
# ---------------------------------------------------


@app.get("/validar-inscripcion")
def validar_inscripcion():
    try:
        dni = request.args.get("dni")
        id_torneo = request.args.get("id_torneo")

        if not dni or not id_torneo:
            return jsonify({"existe": False}), 200

        cursor = db.cursor()
        if not cursor:
            return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

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

    except Exception:
        return jsonify({"existe": False}), 200

# ---------------------------------------------------
# GET TORNEOS
# ---------------------------------------------------


@app.get("/torneos/")
def get_all_torneos():
    cursor = db.cursor(dictionary=True)
    if not cursor:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    cursor.execute("""
        SELECT  
            t.id_torneo,
            t.fecha,
            s.id_sede,
            s.nombre,
            s.direccion,
            s.ciudad
        FROM torneos t
        JOIN sedes s ON t.id_sede = s.id_sede
    """)

    filas = cursor.fetchall()

    torneos = []
    for f in filas:
        torneos.append({
            "id_torneo": f["id_torneo"],
            "fecha": f["fecha"].isoformat(),
            "sede": {
                "id_sede": f["id_sede"],
                "nombre": f["nombre"],
                "direccion": f["direccion"],
                "ciudad": f["ciudad"]
            }
        })

    return jsonify(torneos), 200


# ---------------------------------------------------
# POST CONTACTO
# ---------------------------------------------------
@app.post("/contactoForm/")
def insert_mensaje():
    if not cursor:
        return Response(MENSAJE_ERROR_CONEXION, status=500)

    try:
        cursor.execute(
            """
            INSERT INTO mensajes(nombre, apellido, email, motivo, mensaje)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                request.form["nombre"],
                request.form["apellido"],
                request.form["email"],
                request.form["motivo"],
                request.form["mensaje"]
            )
        )
        db.commit()
        return jsonify({"ok": True}), 201

    except IntegrityError as e:
        db.rollback()
        logger.error(e)
        return jsonify({"error": "Error al insertar mensaje"}), 400


# ---------------------------------------------------
# POST USUARIO / TORNEO CON USUARIO NUEVO
# ---------------------------------------------------
@app.post("/torneo-usuario-form/")
def insert_jugador():

    if not cursor:
        return Response(MENSAJE_ERROR_CONEXION, status=500)

    try:

        # 1️⃣ Insertar usuario
        cursor.execute(
            """
            INSERT INTO usuario
            (nombre, apellido, dni, email, telefono, nacimiento)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                request.form["nombre"],
                request.form["apellido"],
                request.form["dni"],
                request.form["email"],
                request.form["telefono"],
                request.form["nacimiento"],

            )
        )

        id_usuario = cursor.lastrowid  # 👈 IMPORTANTE

        # 2️⃣ Relacionar con torneo
        cursor.execute(
            """
            INSERT INTO jugadores_torneos
            (id_usuario, id_torneo, identificador, fecha_inscripcion)
            VALUES (%s, %s, %s, %s)
            """,
            (
                id_usuario,
                request.form["id_torneo"],
                request.form["identificador"],
                request.form["fecha_inscripcion"]

            )
        )

        db.commit()
        return jsonify({"ok": True}), 201

    except IntegrityError as e:
        db.rollback()
        logger.error(e)
        return jsonify({"error": "Error al insertar inscripción"}), 400


# ---------------------------------------------------
# POST USUARIO / TORNEO CON USUARIO EXISTENTE
# ---------------------------------------------------
@app.post("/torneoForm/")
@jwt_required()
def insert_inscripcion():
    

    if not cursor:
        return Response(MENSAJE_ERROR_CONEXION, status=500)

    try:
      
        cursor.execute(
            """
            INSERT INTO jugadores_torneos
            (id_usuario, id_torneo, identificador, fecha_inscripcion)
            VALUES (%s, %s, %s, %s)
            """,
            (
                request.form["id_usuario"],
                request.form["id_torneo"],
                request.form["identificador"],
                request.form["fecha_inscripcion"]

            )
        )

        db.commit()
        return jsonify({"ok": True}), 201

    except IntegrityError as e:
        db.rollback()
        logger.error(e)
        return jsonify({"error": "Error al insertar usuario"}), 400


# ---------------------------------------------------
# Usuarios - registro, login, logout
# ---------------------------------------------------




# ---------------------------------------------------
# MAIN
# ---------------------------------------------------
if __name__ == "__main__":
    try:
        print("Servidor corriendo en http://127.0.0.1:5000")
        serve(app, host="127.0.0.1", port=5000)
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
