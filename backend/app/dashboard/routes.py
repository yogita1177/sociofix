from fastapi import APIRouter, Depends

from app.auth.dependencies import admin_required
from app.dashboard.service import DashboardService
from app.utils.response import success_response

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("/")
def dashboard(
    current_user=Depends(admin_required),
):

    data = DashboardService.get_dashboard()

    return success_response(
        message="Dashboard Summary",
        data=data,
    )