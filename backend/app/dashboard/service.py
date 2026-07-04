from datetime import datetime, timedelta
from app.database.mongodb import (
    get_complaints_collection,
    get_notices_collection,
)

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
        
        summary = {
            "total_complaints": complaints.count_documents({}),
            "pending": complaints.count_documents({"status": "Pending"}),
            "in_progress": complaints.count_documents({"status": "In Progress"}),
            "resolved": complaints.count_documents({"status": "Resolved"}),

            "high_priority": complaints.count_documents(
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
        
    }

        return summary