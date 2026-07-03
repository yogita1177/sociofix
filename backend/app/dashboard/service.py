from app.database.mongodb import (
    get_complaints_collection,
    get_notices_collection,
)

class DashboardService:

    @staticmethod
    def get_dashboard():

        complaints = get_complaints_collection()
        notices = get_notices_collection()

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
            "total_notices": notices.count_documents({}),
        }