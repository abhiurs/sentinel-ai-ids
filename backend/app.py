import os

from flask import Flask
from flask_cors import CORS

from database.mongodb import db
from routes.auth_routes import auth_bp
from routes.predict_routes import predict_bp
from routes.history_routes import history_bp
from routes.live import live_bp

app = Flask(__name__)

app.config.from_object("config.Config")

frontend_url = os.getenv("FRONTEND_URL")

if frontend_url:
    CORS(app, origins=[frontend_url])
else:
    CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(predict_bp)
app.register_blueprint(history_bp)
app.register_blueprint(live_bp)


@app.route("/")
def home():
    return {
        "project": "Sentinel AI IDS",
        "status": "Backend Running",
        "database": "MongoDB Connected",
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
