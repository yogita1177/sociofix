import os
import uuid
from bson import ObjectId
from fastapi import UploadFile

from datetime import datetime, timedelta

from fastapi import HTTPException

from app.database.mongodb import get_complaints_collection
from app.core.config import settings

from app.utils.email import send_email

class ComplaintService:

    @staticmethod
    def serialize_complaint(complaint: dict):

        history = []

        for item in complaint.get("history", []):
            history.append(
            {
                "status": item["status"],
                "actor": item["actor"],
                "note": item["note"],
                "timestamp": (
                    item["timestamp"].isoformat()
                    if item.get("timestamp")
                    else None
                ),
            }
        )

        return {
            "_id": str(complaint["_id"]),
            "complaint_id": complaint["complaint_id"],
            "title": complaint["title"],
            "description": complaint["description"],
            "category": complaint["category"],
            "priority": complaint["priority"],
            "status": complaint["status"],
            "resident_id": complaint["resident_id"],
            "resident_name": complaint["resident_name"],
            "block": complaint["block"],
            "flat_number": complaint["flat_number"],
            "assigned_to": complaint.get("assigned_to"),
            "images": complaint.get("images", []),
            "history": history,
            "created_at": (
                complaint["created_at"].isoformat()
                if complaint.get("created_at")
                else None
        ),
            "updated_at": (
                complaint["updated_at"].isoformat()
                if complaint.get("updated_at")
                else None
        ),
            "resolved_at": (
                complaint["resolved_at"].isoformat()
                if complaint.get("resolved_at")
                else None
        ),
    }

    @staticmethod
    async def create_complaint(
        title,
        description,
        category,
        block,
        flat_number,
        image: UploadFile | None,
        current_user,
    ):

        complaints = get_complaints_collection()

        image_paths = []

        if image:
            os.makedirs("uploads", exist_ok=True)

            ext = image.filename.split(".")[-1]
            filename = f"{uuid.uuid4()}.{ext}"

            filepath = os.path.join("uploads", filename)

            with open(filepath, "wb") as buffer:
                buffer.write(await image.read())

            image_paths.append(f"/uploads/{filename}")

        complaint = {
            "complaint_id": f"CMP-{int(datetime.utcnow().timestamp())}",
            "title": title,
            "description": description,
            "category": category,
            "priority": "Medium",
            "status": "Pending",
            "resident_id": current_user["_id"],
            "resident_name": current_user["name"],
            "resident_email": current_user["email"],
            "block": block,
            "flat_number": flat_number,
            "assigned_to": None,
            "images": image_paths,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "resolved_at": None,
            "history": [
                {
                    "status": "Pending",
                    "actor": current_user["name"],
                    "note": "Complaint Created",
                    "timestamp": datetime.utcnow(),
                }
            ],
        }

        result = complaints.insert_one(complaint)
        complaint["_id"] = result.inserted_id

        send_email(
            current_user["email"],
            "Complaint Registered - SocioFix",
            f"""
        Hello {current_user["name"]},

        Your complaint has been registered successfully.

        Complaint ID: {complaint["complaint_id"]}
        Title: {complaint["title"]}
        Status: {complaint["status"]}

        Thank you,
        SocioFix
        """
        )

        return ComplaintService.serialize_complaint(complaint)
    
    
    @staticmethod
    def get_my_complaints(current_user):

        complaints = get_complaints_collection()

        data = list(
            complaints.find(
                {
                    "resident_id": current_user["_id"]
                }
            )
        )

        return [
            ComplaintService.serialize_complaint(item)
            for item in data
        ]
        
    @staticmethod
    def get_all_complaints(
        status=None,
        priority=None,
        category=None,
        block=None,
        date=None,
        search=None,
    ):

        complaints = get_complaints_collection()

        query = {}

        if status:
            query["status"] = status

        if priority:
            query["priority"] = priority

        if category:
            query["category"] = category

        if block:
            query["block"] = block
            
        if date:
            selected_date = datetime.strptime(
                date,
                "%Y-%m-%d",
            )

            next_day = selected_date + timedelta(days=1)

            query["created_at"] = {
                "$gte": selected_date,
                "$lt": next_day,
            }
            
        if search:
            query["$or"] = [
        {
                "title": {
                    "$regex": search,
                    "$options": "i",
            }
        },
        {
                "description": {
                    "$regex": search,
                    "$options": "i",
            }
        },
        {
                "resident_name": {
                    "$regex": search,
                    "$options": "i",
            }
        },
    ]

        data = list(
            complaints.find(query)
        )

        return [
            ComplaintService.serialize_complaint(item)
            for item in data
        ]
        
    @staticmethod
    def get_overdue_complaints():
        complaints = get_complaints_collection()

        overdue_days = getattr(settings, "OVERDUE_COMPLAINT_DAYS", 7)
        cutoff = datetime.utcnow() - timedelta(days=overdue_days)

        data = list(
            complaints.find(
                {
                    "status": {"$ne": "Resolved"},
                    "created_at": {"$lt": cutoff},
                }
            ).sort("created_at", -1)
        )

        return [
            ComplaintService.serialize_complaint(item)
            for item in data
        ]


    @staticmethod
    def get_complaint(complaint_id):

        complaints = get_complaints_collection()

        complaint = complaints.find_one({
            "complaint_id": complaint_id
        })

        if complaint is None:
            return None

        return ComplaintService.serialize_complaint(complaint)    

    @staticmethod
    def update_complaint(
        complaint_id,
        data,
        current_user,
    ):

        complaints = get_complaints_collection()

        complaint = complaints.find_one(
        {
            "complaint_id": complaint_id
        }
    )

        if complaint is None:
            raise HTTPException(
                status_code=404,
                detail="Complaint not found",
            )

        if complaint["resident_id"] != current_user["_id"]:
            raise HTTPException(
                status_code=403,
                detail="Unauthorized",
            )

        if complaint["status"] != "Pending":
            raise HTTPException(
                status_code=400,
                detail="Only pending complaints can be edited.",
            )

        update_data = {
            k: v
            for k, v in data.model_dump().items()
            if v is not None
        }

        update_data["updated_at"] = datetime.utcnow()

        complaints.update_one(
            {
                "complaint_id": complaint_id
            },
            {
                "$set": update_data
            },
        )

        complaint.update(update_data)

        return ComplaintService.serialize_complaint(complaint)

    @staticmethod
    def delete_complaint(
        complaint_id,
        current_user,
    ):

        complaints = get_complaints_collection()

        complaint = complaints.find_one(
            {
                "complaint_id": complaint_id
            }
        )

        if complaint is None:
            raise HTTPException(
                status_code=404,
                detail="Complaint not found",
            )

        if complaint["resident_id"] != current_user["_id"]:
            raise HTTPException(
                status_code=403,
                detail="Unauthorized",
            )

        if complaint["status"] != "Pending":
            raise HTTPException(
                status_code=400,
                detail="Resolved complaints cannot be deleted.",
            )

        complaints.delete_one(
        {
            "complaint_id": complaint_id
        }
    )

        return True

    @staticmethod
    def update_status(
        complaint_id,
        data,
        current_user,
    ):

        if current_user["role"] != "admin":
            raise ValueError(
                "Only admins can update complaint status."
        )

        complaints = get_complaints_collection()

        complaint = complaints.find_one(
        {
            "complaint_id": complaint_id
        }
    )

        if complaint is None:
            raise ValueError("Complaint not found")

        history = complaint.get("history", [])

        history.append(
        {
            "status": data.status,
            "actor": current_user["name"],
            "note": "Status Updated",
            "timestamp": datetime.utcnow(),
        }
    )

        update = {
            "status": data.status,
            "updated_at": datetime.utcnow(),
            "history": history,
        }

        if data.status == "Resolved":
            update["resolved_at"] = datetime.utcnow()

        complaints.update_one(
        {
            "complaint_id": complaint_id
        },
        {
            "$set": update
        },
    )

        complaint.update(update)

        resident_email = complaint.get("resident_email")

        if resident_email:
            send_email(
                resident_email,
                "Complaint Status Updated - SocioFix",
                f"""
        Hello {complaint["resident_name"]},

        Your complaint status has been updated.

        Complaint:
        {complaint["title"]}

        New Status:
        {data.status}

        Regards,
        SocioFix
        """
            )

        return ComplaintService.serialize_complaint(
            complaint
        )
    
    @staticmethod
    def update_priority(
        complaint_id,
        data,
        current_user,
    ):

        if current_user["role"] != "admin":
            raise ValueError(
                "Only admins can update priority."
            )

        complaints = get_complaints_collection()

        complaint = complaints.find_one(
            {
                "complaint_id": complaint_id
            }
        )

        if complaint is None:
            raise ValueError("Complaint not found")

        history = complaint.get("history", [])

        history.append(
        {
            "status": complaint["status"],
            "actor": current_user["name"],
            "note": f"Priority changed to {data.priority}",
            "timestamp": datetime.utcnow(),
        }
    )

        update = {
            "priority": data.priority,
            "updated_at": datetime.utcnow(),
            "history": history,
    }

        complaints.update_one(
        {
            "complaint_id": complaint_id
        },
        {
            "$set": update
        }
    )

        complaint.update(update)

        return ComplaintService.serialize_complaint(
            complaint
    )