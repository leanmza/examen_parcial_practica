from flask import request, jsonify
from flask import Flask, jsonify,request
from flask_cors import CORS
from logger import logger
from waitress import serve
from jsonwebtoken import (configurar_jwt, generar_token, get_jwt, get_jwt_identity,
                          jwt_required, token_blacklist, TOKEN_REFRESH_ROUTE, unset_jwt_cookies)
from routes.user import user_bp
from routes.torneo import torneo_bp
from routes.auth import auth_bp
from routes.contacto import contacto_bp
import os



app = Flask("gente-server",
            static_folder=__file__.replace(f"servidor{os.sep}app.py", "static"))

CORS(app,
     supports_credentials=True,
     origins=["http://127.0.0.1:5500"])

app.register_blueprint(user_bp)
app.register_blueprint(torneo_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(contacto_bp)

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
# MAIN
# ---------------------------------------------------
if __name__ == "__main__":
    print("Servidor corriendo en http://127.0.0.1:5000")
    serve(app, host="127.0.0.1", port=5000)
