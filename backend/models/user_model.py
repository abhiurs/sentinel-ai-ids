from database.mongodb import db
from datetime import datetime

users_collection = db["users"]


def create_user(username, email, hashed_password):
    """
    Create a new user in MongoDB.
    """

    user = {
        "username": username,
        "email": email,
        "password": hashed_password,
        "role": "SOC Analyst",
        "createdAt": datetime.utcnow()
    }

    result = users_collection.insert_one(user)

    return result.inserted_id


def get_user_by_email(email):
    """
    Find a user using email.
    """

    return users_collection.find_one({"email": email})


def get_user_by_id(user_id):
    """
    Find a user using MongoDB ObjectId.
    """

    from bson import ObjectId

    return users_collection.find_one({"_id": ObjectId(user_id)})