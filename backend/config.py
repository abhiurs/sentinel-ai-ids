import os
from dotenv import load_dotenv

load_dotenv()


def get_required_env(name):
    value = os.getenv(name)

    if not value:
        raise RuntimeError(f"Required environment variable '{name}' is not configured.")

    return value


class Config:
    SECRET_KEY = get_required_env("SECRET_KEY")
    JWT_SECRET_KEY = get_required_env("JWT_SECRET_KEY")

    MONGO_URI = get_required_env("MONGO_URI")
    DATABASE_NAME = get_required_env("DATABASE_NAME")

    # Used by Flask CORS configuration
    FRONTEND_URL = os.getenv("FRONTEND_URL", "")
