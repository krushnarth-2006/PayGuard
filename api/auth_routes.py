from fastapi import APIRouter

from api.auth import (
    create_user,
    create_and_send_otp,
    verify_otp,
    verify_user_email,
    get_user,
    verify_password,
    update_password,
)

from api.schemas import (
    RegisterRequest,
    VerifyEmailRequest,
    LoginRequest,
    OTPRequest,
    ResetPasswordRequest,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# =========================
# CUSTOMER REGISTRATION
# =========================

@router.post("/register")
def register(request: RegisterRequest):
    create_user(
        name=request.name,
        email=request.email,
        password=request.password,
    )

    create_and_send_otp(
        email=request.email,
        purpose="email_verification",
    )

    return {
        "message": "Account created. OTP sent to your email."
    }


# =========================
# EMAIL VERIFICATION
# =========================

@router.post("/verify-email")
def verify_email(request: VerifyEmailRequest):
    verify_otp(
        email=request.email,
        otp=request.otp,
        purpose="email_verification",
    )

    verify_user_email(request.email)

    return {
        "message": "Email verified successfully."
    }


# =========================
# CUSTOMER LOGIN
# =========================

@router.post("/login")
def login(request: LoginRequest):

    user = get_user(request.email)

    if not user:
        return {
            "success": False,
            "message": "Invalid email or password.",
        }

    if not verify_password(
        request.password,
        user["password_hash"],
    ):
        return {
            "success": False,
            "message": "Invalid email or password.",
        }

    if not user["email_verified"]:
        return {
            "success": False,
            "message": "Please verify your email before logging in.",
        }

    return {
        "success": True,
        "message": "Login successful.",
        "email": user["email"],
        "role": user["role"],
        "name": user["name"],
    }


# =========================
# FORGOT PASSWORD
# =========================

@router.post("/forgot-password")
def forgot_password(request: OTPRequest):

    user = get_user(request.email)

    if user:
        create_and_send_otp(
            email=request.email,
            purpose="password_reset",
        )

    return {
        "message": "If an account exists, a password reset OTP has been sent."
    }


# =========================
# RESET PASSWORD
# =========================

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):

    verify_otp(
        email=request.email,
        otp=request.otp,
        purpose="password_reset",
    )

    update_password(
        email=request.email,
        new_password=request.new_password,
    )

    return {
        "message": "Password reset successfully."
    }


# =========================
# ADMIN LOGIN - PASSWORD
# =========================

@router.post("/admin/login")
def admin_login(request: LoginRequest):

    user = get_user(request.email)

    if not user:
        return {
            "success": False,
            "message": "Invalid admin credentials.",
        }

    if user["role"] != "admin":
        return {
            "success": False,
            "message": "Invalid admin credentials.",
        }

    if not verify_password(
        request.password,
        user["password_hash"],
    ):
        return {
            "success": False,
            "message": "Invalid admin credentials.",
        }

    create_and_send_otp(
        email=user["email"],
        purpose="admin_login",
    )

    return {
        "success": True,
        "message": "Admin OTP sent to your email.",
        "email": user["email"],
    }


# =========================
# ADMIN LOGIN - OTP
# =========================

@router.post("/admin/verify-otp")
def verify_admin_otp(request: VerifyEmailRequest):

    verify_otp(
        email=request.email,
        otp=request.otp,
        purpose="admin_login",
    )

    user = get_user(request.email)

    if not user or user["role"] != "admin":
        return {
            "success": False,
            "message": "Invalid admin account.",
        }

    return {
        "success": True,
        "message": "Admin login successful.",
        "email": user["email"],
        "role": "admin",
        "name": user["name"],
    }