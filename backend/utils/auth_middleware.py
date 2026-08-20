from functools import wraps
from flask import request, jsonify

from utils.jwt_helper import verify_token


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"success": False, "message": "Token is missing."}), 401

        parts = auth_header.split()

        if len(parts) != 2 or parts[0].lower() != "bearer":
            return (
                jsonify({"success": False, "message": "Invalid authorization header."}),
                401,
            )

        token = parts[1]

        payload = verify_token(token)

        if not payload:
            return (
                jsonify({"success": False, "message": "Invalid or expired token."}),
                401,
            )

        return f(payload, *args, **kwargs)

    return decorated
