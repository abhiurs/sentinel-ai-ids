from flask import Blueprint, request, jsonify
from utils.auth_middleware import token_required
from services.auth_service import register_user, login_user

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return (
            jsonify({"success": False, "message": "Request body must be valid JSON."}),
            400,
        )

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    response, status_code = register_user(
        username=username, email=email, password=password
    )

    return jsonify(response), status_code


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return (
            jsonify({"success": False, "message": "Request body must be valid JSON."}),
            400,
        )

    email = data.get("email")
    password = data.get("password")

    response, status_code = login_user(email=email, password=password)

    return jsonify(response), status_code


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user(payload):

    return jsonify({"success": True, "data": {"user": payload}}), 200
