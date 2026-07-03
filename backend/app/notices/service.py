from datetime import datetime

from app.database.mongodb import get_notices_collection


class NoticeService:

    @staticmethod
    def serialize_notice(notice: dict):

        notice["_id"] = str(notice["_id"])

        notice["created_at"] = (
            notice["created_at"].isoformat()
            if notice.get("created_at")
            else None
        )

        notice["updated_at"] = (
            notice["updated_at"].isoformat()
            if notice.get("updated_at")
            else None
        )

        return notice

    @staticmethod
    def create_notice(data, current_user):

        notices = get_notices_collection()

        notice = {
            "notice_id": f"NOT-{int(datetime.utcnow().timestamp())}",
            "title": data.title,
            "content": data.content,
            "created_by": current_user["name"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        result = notices.insert_one(notice)

        notice["_id"] = result.inserted_id

        return NoticeService.serialize_notice(notice)

    @staticmethod
    def get_all_notices():

        notices = get_notices_collection()

        data = list(
            notices.find().sort("created_at", -1)
        )

        return [
            NoticeService.serialize_notice(item)
            for item in data
        ]

    @staticmethod
    def get_notice(notice_id):

        notices = get_notices_collection()

        notice = notices.find_one(
            {
                "notice_id": notice_id
            }
        )

        if notice is None:
            return None

        return NoticeService.serialize_notice(notice)

    @staticmethod
    def update_notice(
        notice_id,
        data,
    ):

        notices = get_notices_collection()

        notice = notices.find_one(
            {
                "notice_id": notice_id
            }
        )

        if notice is None:
            raise ValueError("Notice not found")

        update_data = {
            k: v
            for k, v in data.model_dump().items()
            if v is not None
        }

        update_data["updated_at"] = datetime.utcnow()

        notices.update_one(
            {
                "notice_id": notice_id
            },
            {
                "$set": update_data
            }
        )

        notice.update(update_data)

        return NoticeService.serialize_notice(notice)

    @staticmethod
    def delete_notice(notice_id):

        notices = get_notices_collection()

        result = notices.delete_one(
            {
                "notice_id": notice_id
            }
        )

        if result.deleted_count == 0:
            raise ValueError("Notice not found")

        return True