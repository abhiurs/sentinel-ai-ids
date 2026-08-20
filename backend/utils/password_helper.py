import bcrypt


def hash_password(password):
    """
    Hash a plain text password.
    """

    salt = bcrypt.gensalt()

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        salt
    )

    return hashed_password.decode("utf-8")


def verify_password(password, hashed_password):
    """
    Verify a password against its hash.
    """

    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )