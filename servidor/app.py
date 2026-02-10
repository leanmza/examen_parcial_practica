from db import db, cursor, MENSAJE_ERROR_CONEXION, IntegrityError
from flask import Flask, jsonify, Response, request
from flask_cors import CORS
from logger import logger
from waitress import serve

app = Flask("gente-server")

CORS(app, resources={
    r"/contactoForm/": {
        "methods": ["POST"],
        "origins": "http://127.0.0.1:5500"
    },
    r"/torneo-jugador-form/": {
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
    r"/validar-jugador": {
        "methods": ["GET"],
        "origins": "http://127.0.0.1:5500"
    }
})

# ---------------------------------------------------
# GET JUGADOR
# ---------------------------------------------------

@app.route("/validar-jugador", methods=["GET"])
def get_jugador_por_dni():

    dni = request.args.get("dni")

    if not dni:
        return jsonify({"id_jugador": None}), 200

    cursor = db.cursor(dictionary=True)
    if not cursor:
        return jsonify({"error": MENSAJE_ERROR_CONEXION}), 500

    cursor.execute("""
        SELECT id_jugador
        FROM jugadores
        WHERE dni = %s
    """, (dni,))

    row = cursor.fetchone()

    if row is None:
        return jsonify({"id_jugador": None}), 200

    return jsonify({"id_jugador": row["id_jugador"]}), 200


# ---------------------------------------------------
# GET JUGADOR-TORNEO
# ---------------------------------------------------


@app.route("/validar-inscripcion", methods=["GET"])
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
            JOIN jugadores j ON jt.id_jugador = j.id_jugador
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


@app.route("/torneos/", methods=["GET"])
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
@app.route("/contactoForm/", methods=["POST"])
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
# POST JUGADOR / TORNEO CON JUGADOR NUEVO
# ---------------------------------------------------
@app.route("/torneo-jugador-form/", methods=["POST"])
def insert_jugador():

    if not cursor:
        return Response(MENSAJE_ERROR_CONEXION, status=500)

    try:

        # 1️⃣ Insertar jugador
        cursor.execute(
            """
            INSERT INTO jugadores
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

        id_jugador = cursor.lastrowid  # 👈 IMPORTANTE

        # 2️⃣ Relacionar con torneo
        cursor.execute(
            """
            INSERT INTO jugadores_torneos
            (id_jugador, id_torneo, identificador, fecha_inscripcion)
            VALUES (%s, %s, %s, %s)
            """,
            (
                id_jugador,
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
# POST JUGADOR / TORNEO CON JUGADOR EXISTENTE
# ---------------------------------------------------
@app.route("/torneoForm/", methods=["POST"])
def insert_inscripcion():

    if not cursor:
        return Response(MENSAJE_ERROR_CONEXION, status=500)

    try:
      
        cursor.execute(
            """
            INSERT INTO jugadores_torneos
            (id_jugador, id_torneo, identificador, fecha_inscripcion)
            VALUES (%s, %s, %s, %s)
            """,
            (
                request.form["id_jugador"],
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
        return jsonify({"error": "Error al insertar jugador"}), 400


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
