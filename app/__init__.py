import os

from flask import Flask


def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-secret-change-me")

    from app.db import init_db
    init_db()

    from app.routes import bp
    app.register_blueprint(bp)

    return app
