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
    r"/torneoForm/": {
        "methods": ["POST"],
        "origins": "http://127.0.0.1:5500"
    }
})

@app.before_request
def log_peticion():
    logger.info(f"{request.method} {request.path} desde {request.remote_addr}")
# @app.route("/persona/", methods=["GET"])
# def get_all_gente():
#     json = None
#     if cursor:
#         cursor.execute("SELECT * FROM tablapersonas;")
#         json = jsonify(cursor.fetchall())
#     else:
#         json = jsonify({"error": MENSAJE_ERROR_CONEXION}), 500
#     return json
@app.route("/contactoForm/", methods=["POST"])
def insert_mensaje():
    res = None
    if cursor:
        try:
            cursor.execute(  "INSERT INTO mensajes(nombre, apellido, email, motivo, mensaje) VALUES (%s, %s, %s, %s, %s);",
  
                [request.form["nombre"],
                 request.form["apellido"],
                 request.form["email"],
                 request.form["motivo"],
                 request.form["mensaje"] ])
            db.commit()
            res = Response({"ok": True}, status=201)
        except IntegrityError:
            db.rollback()
            # res = Response(MENSAJE_ERROR_UNIQUE, status=400)
    else:
        res = Response(MENSAJE_ERROR_CONEXION, status=500)
    return res

@app.route("/torneoForm/", methods=["POST"])
def insert_jugador():
    res = None
    if cursor:
        try:
            cursor.execute(  "INSERT INTO jugadores(nombre, apellido, edad, direccion, telefono, sede, fecha, identificador) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);",
  
                [request.form["nombre"],
                 request.form["apellido"],
                 request.form["edad"],
                 request.form["direccion"],
                 request.form["telefono"],
                 request.form["sede"],
                 request.form["fecha"], 
                 request.form["identificador"]] )
            
            db.commit()
            res = Response({"ok": True}, status=201)
        except IntegrityError:
            db.rollback()
            # res = Response(MENSAJE_ERROR_UNIQUE, status=400)
    else:
        res = Response(MENSAJE_ERROR_CONEXION, status=500)
    return res

if __name__=="__main__":
    try:
        serve(app, host="127.0.0.1", port=5000)
    finally:
        cursor.close() if cursor else None
        db.close() if db else None
