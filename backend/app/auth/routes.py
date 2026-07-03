from fastapi import APIRouter, HTTPException, Depends

from app.auth.schemas import (
    RegisterRequest,
    LoginRequest,
)
from app.auth.service import AuthService
from app.auth.dependencies import get_current_user
from app.utils.response import success_response

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post("/register")
def register(data: RegisterRequest):

    try:
        user = AuthService.register_user(data)

        return success_response(
            message="User Registered Successfully",
            data=user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.post("/login")
def login(data: LoginRequest):

    try:
        token = AuthService.login(data)

        return success_response(
            message="Login Successful",
            data=token,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e),
        )


@router.get("/me")
def me(current_user=Depends(get_current_user)):

    return success_response(
        message="Current User",
        data=current_user,
    )