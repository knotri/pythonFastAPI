from motor.motor_asyncio import AsyncIOMotorClient
import os

# Replace 'localhost' and '27017' with your MongoDB connection details if necessary
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = "payments_db"

# Create an instance of AsyncIOMotorClient and connect to the database
client = AsyncIOMotorClient(MONGO_URL)
database = client[DATABASE_NAME]