from datetime import datetime, timedelta

from app.database.mongodb import (
    get_complaints_collection,
    get_notices_collection,
)
from app.complaints.service import ComplaintService
from app.notices.service import NoticeService


class DashboardService:

    @staticmethod
    def get_dashboard():

        complaints = get_complaints_collection()
        notices = get_notices_collection()

        seven_days_ago = datetime.utcnow() - timedelta(days=7)

        category_pipeline = [
            {
                "$group": {
                    "_id": "$category",
                    "count": {"$sum": 1},
                }
            }
        ]

        category_data = list(
            complaints.aggregate(category_pipeline)
        )

        category_summary = {
            item["_id"]: item["count"]
            for item in category_data
        }

        recent_complaints = [
            ComplaintService.serialize_complaint(c)
            for c in complaints.find()
            .sort("created_at", -1)
            .limit(5)
        ]

        recent_notices = [
            NoticeService.serialize_notice(n)
            for n in notices.find()
            .sort("created_at", -1)
            .limit(5)
        ]

        return {
            "total_complaints": complaints.count_documents({}),

            "pending": complaints.count_documents(
                {"status": "Pending"}
            ),

            "in_progress": complaints.count_documents(
                {"status": "In Progress"}
            ),

            "resolved": complaints.count_documents(
                {"status": "Resolved"}
            ),

            "high_priority_complaints": complaints.count_documents(
                {"priority": "High"}
            ),

            "overdue_complaints": complaints.count_documents(
                {
                    "status": {"$ne": "Resolved"},
                    "created_at": {"$lt": seven_days_ago},
                }
            ),

            "total_notices": notices.count_documents({}),

            "pinned_notices": notices.count_documents(
                {
                    "is_pinned": True
                }
            ),

            "complaints_by_category": category_summary,

            "recent_complaints": recent_complaints,

            "recent_notices": recent_notices,
        }