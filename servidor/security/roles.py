from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, jwt_required

ADMIN = "admin"
USER = "user"

def role_required(*roles):
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()
            user_role = claims.get("rol")

            if user_role not in roles:
                return jsonify({"error": "No autorizado"}), 403

            return fn(*args, **kwargs)

        return decorator
    return wrapper