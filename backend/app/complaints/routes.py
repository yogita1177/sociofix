from fastapi import APIRouter, Depends, HTTPException

from app.auth.dependencies import get_current_user
from app.complaints.schemas import (
    ComplaintCreate,
    ComplaintUpdate,
    ComplaintStatusUpdate,
    UpdatePriorityRequest,
)
from app.complaints.service import ComplaintService
from app.utils.response import success_response

router = APIRouter(
    prefix="/api/complaints",
    tags=["Complaints"],
)


# -----------------------------
# Resident
# -----------------------------

@router.post("/")
def create_complaint(
    data: ComplaintCreate,
    current_user=Depends(get_current_user),
):
    complaint = ComplaintService.create_complaint(
        data,
        current_user,
    )

    return success_response(
        message="Complaint Created Successfully",
        data=complaint,
    )


@router.get("/my")
def get_my_complaints(
    current_user=Depends(get_current_user),
):
    complaints = ComplaintService.get_my_complaints(
        current_user,
    )

    return success_response(
        message="Complaints fetched successfully",
        data=complaints,
    )


# -----------------------------
# Admin - Filter Complaints
# -----------------------------

@router.get("/")
def get_all_complaints(
    status: str | None = None,
    priority: str | None = None,
    category: str | None = None,
    block: str | None = None,
    date: str | None = None,
    search: str | None = None,
    current_user=Depends(get_current_user),
):

    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    complaints = ComplaintService.get_all_complaints(
        status=status,
        priority=priority,
        category=category,
        block=block,
        date=date,
        search=search,
    )

    return success_response(
        message="Complaints fetched successfully",
        data=complaints,
    )

@router.get("/overdue")
def get_overdue_complaints(
    current_user=Depends(get_current_user),
):

        if current_user["role"] != "admin":
            raise HTTPException(
                status_code=403,
                detail="Admin access required",
            )

        complaints = ComplaintService.get_overdue_complaints()

        return success_response(
            message="Overdue complaints fetched successfully",
            data=complaints,
        )


@router.get("/{complaint_id}")
def get_complaint(
    complaint_id: str,
):
    complaint = ComplaintService.get_complaint(
        complaint_id
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found",
        )

    return success_response(
        message="Complaint fetched successfully",
        data=complaint,
    )


@router.put("/{complaint_id}")
def update_complaint(
    complaint_id: str,
    data: ComplaintUpdate,
    current_user=Depends(get_current_user),
):
    try:
        complaint = ComplaintService.update_complaint(
            complaint_id,
            data,
            current_user,
        )

        return success_response(
            message="Complaint Updated Successfully",
            data=complaint,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=403,
            detail=str(e),
        )


@router.delete("/{complaint_id}")
def delete_complaint(
    complaint_id: str,
    current_user=Depends(get_current_user),
):
    try:
        ComplaintService.delete_complaint(
            complaint_id,
            current_user,
        )

        return success_response(
            message="Complaint Deleted Successfully",
        )

    except ValueError as e:
        raise HTTPException(
            status_code=403,
            detail=str(e),
        )


@router.patch("/{complaint_id}/status")
def update_status(
    complaint_id: str,
    data: ComplaintStatusUpdate,
    current_user=Depends(get_current_user),
):
    try:
        complaint = ComplaintService.update_status(
            complaint_id,
            data,
            current_user,
        )

        return success_response(
            message="Complaint Status Updated",
            data=complaint,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=403,
            detail=str(e),
        )


@router.patch("/{complaint_id}/priority")
def update_priority(
    complaint_id: str,
    data: UpdatePriorityRequest,
    current_user=Depends(get_current_user),
):
    try:
        complaint = ComplaintService.update_priority(
            complaint_id,
            data,
            current_user,
        )

        return success_response(
            message="Priority Updated Successfully",
            data=complaint,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=403,
            detail=str(e),
        )