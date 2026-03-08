from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, jwt_required

ADMIN = "admin"
USER = "user"

def role_required(role):
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()

            if claims["rol"] != role:
                return jsonify({"error": "No autorizado"}), 403

            return fn(*args, **kwargs)

        return decorator
    return wrapper