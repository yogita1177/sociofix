from datetime import datetime, timedelta

from fastapi import HTTPException

from app.database.mongodb import get_complaints_collection


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

    # NEW
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

        seven_days_ago = datetime.utcnow() - timedelta(days=7)

        data = list(
            complaints.find(
            {
                "status": {
                    "$ne": "Resolved"
                },
                "created_at": {
                    "$lt": seven_days_ago
                },
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