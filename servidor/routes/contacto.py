from flask import Blueprint, request, jsonify
from db import get_db, MENSAJE_ERROR_CONEXION, Error, IntegrityError

contacto_bp = Blueprint("contacto", __name__, url_prefix="/contacto")

# ---------------------------------------------------
# POST CONTACTO
# ---------------------------------------------------

# Guardo los mensajes 
@contacto_bp.post("/")
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

