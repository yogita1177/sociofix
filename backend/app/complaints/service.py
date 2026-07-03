from datetime import datetime

from fastapi import HTTPException

from app.database.mongodb import get_complaints_collection


class ComplaintService:

    @staticmethod
    def serialize_complaint(complaint: dict):

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
            "created_at": complaint["created_at"].isoformat()
            if complaint.get("created_at")
            else None,
            "updated_at": complaint["updated_at"].isoformat()
            if complaint.get("updated_at")
            else None,
            "resolved_at": complaint["resolved_at"].isoformat()
            if complaint.get("resolved_at")
            else None,
        }

    @staticmethod
    def create_complaint(data, current_user):

        complaints = get_complaints_collection()

        complaint = {
            "complaint_id": f"CMP-{int(datetime.utcnow().timestamp())}",
            "title": data.title,
            "description": data.description,
            "category": data.category,
            "priority": "Medium",
            "status": "Pending",
            "resident_id": current_user["_id"],
            "resident_name": current_user["name"],
            "block": data.block,
            "flat_number": data.flat_number,
            "assigned_to": None,
            "images": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "resolved_at": None,
        }

        result = complaints.insert_one(complaint)
        complaint["_id"] = result.inserted_id

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
    def get_complaint(complaint_id):

        complaints = get_complaints_collection()

        complaint = complaints.find_one(
            {
                "complaint_id": complaint_id
            }
        )

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

        #if current_user["role"] != "admin":
        #   raise HTTPException(
        #       status_code=403,
        #       detail="Only admins can update complaint status.",
        #)

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

        update = {
            "status": data.status,
            "updated_at": datetime.utcnow(),
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

        return ComplaintService.serialize_complaint(complaint)