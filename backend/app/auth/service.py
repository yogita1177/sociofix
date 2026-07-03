from datetime import datetime

from bson import ObjectId

from app.database.mongodb import get_database
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)


class AuthService:

    @staticmethod
    def serialize_user(user: dict):
        return {
            "_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "phone": user.get("phone"),
            "block": user.get("block"),
            "flat_number": user.get("flat_number"),
            "created_at": (
                user["created_at"].isoformat()
                if user.get("created_at")
                else None
            ),
        }

    @staticmethod
    def register_user(data):
        db = get_database()

        existing = db.users.find_one(
            {"email": data.email}
        )

        if existing:
            raise ValueError("Email already registered")

        user = {
            "name": data.name,
            "email": data.email,
            "password": hash_password(data.password),
            "role": "resident",
            "phone": data.phone,
            "block": data.block,
            "flat_number": data.flat_number,
            "created_at": datetime.utcnow(),
        }

        result = db.users.insert_one(user)

        user["_id"] = result.inserted_id

        return AuthService.serialize_user(user)

    @staticmethod
    def login(data):
        db = get_database()

        user = db.users.find_one(
            {"email": data.email}
        )

        if user is None:
            raise ValueError("Invalid email or password")

        if not verify_password(
            data.password,
            user["password"],
        ):
            raise ValueError("Invalid email or password")

        access_token = create_access_token(
            str(user["_id"]),
            {
                "role": user["role"],
            },
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    @staticmethod
    def get_user(user_id: str):
        db = get_database()

        user = db.users.find_one(
            {"_id": ObjectId(user_id)}
        )

        if user is None:
            return None

        return AuthService.serialize_user(user)