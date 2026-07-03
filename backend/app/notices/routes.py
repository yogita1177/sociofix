from fastapi import APIRouter, Depends, HTTPException

from app.auth.dependencies import (
    get_current_user,
    admin_required,
)
from app.notices.schemas import (
    NoticeCreate,
    NoticeUpdate,
)
from app.notices.service import NoticeService
from app.utils.response import success_response

router = APIRouter(
    prefix="/api/notices",
    tags=["Notices"],
)


@router.post("/")
def create_notice(
    data: NoticeCreate,
    current_user=Depends(admin_required),
):

    try:
        notice = NoticeService.create_notice(
            data,
            current_user,
        )

        return success_response(
            message="Notice Created",
            data=notice,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.get("/")
def get_all_notices():

    notices = NoticeService.get_all_notices()

    return success_response(
        message="All Notices",
        data=notices,
    )


@router.get("/{notice_id}")
def get_notice(notice_id: str):

    notice = NoticeService.get_notice(
        notice_id
    )

    if notice is None:
        raise HTTPException(
            status_code=404,
            detail="Notice not found",
        )

    return success_response(
        message="Notice Details",
        data=notice,
    )


@router.put("/{notice_id}")
def update_notice(
    notice_id: str,
    data: NoticeUpdate,
    current_user=Depends(admin_required),
):

    try:
        notice = NoticeService.update_notice(
            notice_id,
            data,
        )

        return success_response(
            message="Notice Updated",
            data=notice,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.delete("/{notice_id}")
def delete_notice(
    notice_id: str,
    current_user=Depends(admin_required),
):

    try:
        NoticeService.delete_notice(
            notice_id
        )

        return success_response(
            message="Notice Deleted",
            data=True,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )