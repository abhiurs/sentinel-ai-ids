import re


def validate_register_data(data):
    errors = {}

    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    # Username Validation
    if not username:
        errors["username"] = "Username is required."

    elif len(username) < 3:
        errors["username"] = "Username must be at least 3 characters."

    # Email Validation
    email_pattern = r"^[^@]+@[^@]+\.[^@]+$"

    if not email:
        errors["email"] = "Email is required."

    elif not re.match(email_pattern, email):
        errors["email"] = "Invalid email address."

    # Password Validation
    if not password:
        errors["password"] = "Password is required."

    elif len(password) < 8:
        errors["password"] = "Password must contain at least 8 characters."

    return errors