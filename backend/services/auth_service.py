from models.user_model import create_user, get_user_by_email
from utils.password_helper import hash_password
from schemas.register_schema import validate_register_data
from schemas.login_schema import validate_login_data
from utils.password_helper import verify_password
from utils.jwt_helper import generate_token

    
def register_user(username, email, password):
    data = {
        "username": username,
        "email": email,
        "password": password,
    }

    errors = validate_register_data(data)

    if errors:
        return {
            "success": False,
            "message": "Validation failed.",
            "errors": errors
        }, 400


    existing_user = get_user_by_email(email)

    if existing_user:
        return {
        "success": False,
        "message": "Email already exists.",
        "errors": None
    }, 409

    hashed_password = hash_password(password)

    user_id = create_user(
        username=username,
        email=email,
        hashed_password=hashed_password
    )

    return {
    "success": True,
    "message": "User registered successfully.",
    "data": {
        "userId": str(user_id)
    }
}, 201

def login_user(email, password):

    data = {
        "email": email,
        "password": password
    }

    errors = validate_login_data(data)

    if errors:
        return {
            "success": False,
            "message": "Validation failed.",
            "errors": errors
        }, 400

    user = get_user_by_email(email)

    if not user:
        return {
            "success": False,
            "message": "Invalid email or password.",
            "errors": None
        }, 401

    if not verify_password(password, user["password"]):
        return {
            "success": False,
            "message": "Invalid email or password.",
            "errors": None
        }, 401

    token = generate_token(user)

    return {
        "success": True,
        "message": "Login successful.",
        "data": {
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"],
                "role": user["role"]
            }
        }
    }, 200