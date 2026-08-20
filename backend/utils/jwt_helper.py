import jwt
from datetime import datetime, timedelta

from config import Config


def generate_token(user):
    """
    Generate JWT token for authenticated user.
    """

    payload = {
        "user_id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(hours=24)
    }

    token = jwt.encode(
        payload,
        Config.JWT_SECRET_KEY,
        algorithm="HS256"
    )

    return token


def verify_token(token):
    """
    Verify and decode JWT token.
    """

    try:
        payload = jwt.decode(
            token,
            Config.JWT_SECRET_KEY,
            algorithms=["HS256"]
        )

        return payload

    except jwt.ExpiredSignatureError:
        return None

    except jwt.InvalidTokenError:
        return None