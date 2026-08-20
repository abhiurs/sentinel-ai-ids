import re


def validate_login_data(data):
    errors = {}

    email = data.get("email", "").strip()
    password = data.get("password", "")

    email_pattern = r"^[^@]+@[^@]+\.[^@]+$"

    if not email:
        errors["email"] = "Email is required."

    elif not re.match(email_pattern, email):
        errors["email"] = "Invalid email address."

    if not password:
        errors["password"] = "Password is required."

    return errors