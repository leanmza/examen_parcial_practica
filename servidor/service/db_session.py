from contextlib import contextmanager
from db import get_db
from mysql.connector import Error

@contextmanager
def db_session(dictionary=True):
    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=dictionary)
        yield cursor
        db.commit()
    except Error as e:
        if db:
            db.rollback()
        raise e
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()