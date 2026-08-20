from pymongo import MongoClient
from config import Config

client = MongoClient(
    Config.MONGO_URI,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    socketTimeoutMS=10000,
    maxPoolSize=50,
    minPoolSize=5,
)


db = client[Config.DATABASE_NAME]
