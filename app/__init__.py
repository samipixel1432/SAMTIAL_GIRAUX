import os

from flask import Flask


def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-secret-change-me")

    from app.db import init_db
    try:
        init_db()
        app.config["STARTUP_ERROR"] = None
    except Exception as error:
        app.config["STARTUP_ERROR"] = error

    from app.routes import bp
    app.register_blueprint(bp)

    return app
