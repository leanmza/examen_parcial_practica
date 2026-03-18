from datetime import timedelta
# JSON Web Tokens
# python -m pip install flask-jwt-extended
from flask_jwt_extended import (JWTManager, create_access_token, create_refresh_token,
    get_jwt, get_jwt_identity, jwt_required, set_access_cookies, set_refresh_cookies, unset_jwt_cookies)
# Queremos defender el sitio web de CSRF y XSS a la vez.
TOKEN_REFRESH_ROUTE = '/token/refresh'
token_blacklist = set()
def configurar_jwt(app):
    app.config['JWT_SECRET_KEY'] = "/Us27ua14ri89os2  ,.-(Ke36y_:;=="
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_COOKIE_SECURE'] = False  # True si hay HTTPS.
    app.config['JWT_COOKIE_SAMESITE'] = 'Strict'
    app.config['JWT_COOKIE_CSRF_PROTECT'] = True # Primer paso para prevenir CSRF.
    app.config['JWT_COOKIE_HTTPONLY'] = True # Primer paso para prevenir XSS.
    app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
    app.config['JWT_REFRESH_COOKIE_PATH'] = TOKEN_REFRESH_ROUTE
    app.config['JWT_BLACKLIST_ENABLED'] = True
    app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']
    return JWTManager(app)

def generar_token(response, id, rol, recordar=False):

    claims = {"rol": rol}

    if recordar:
        access_expires = timedelta(days=7)
        refresh_expires = timedelta(days=30)
    else:
        access_expires = timedelta(minutes=30)
        refresh_expires = timedelta(days=1)

    access_token = create_access_token(
        identity=id,
        additional_claims=claims,
        expires_delta=access_expires
    )

    refresh_token = create_refresh_token(
        identity=id,
        additional_claims=claims,
        expires_delta=refresh_expires
    )

    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)

    return response
__all__ = ["get_jwt", "get_jwt_identity", "jwt_required", "unset_jwt_cookies"]