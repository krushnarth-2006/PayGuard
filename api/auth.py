import os
import secrets
import sqlite3
import smtplib
import hashlib
from datetime import datetime, timedelta
from email.message import EmailMessage
from pathlib import Path

from argon2 import PasswordHasher
from dotenv import load_dotenv
from fastapi import HTTPException


load_dotenv()


BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR / "data" / "payguard_auth.db"


SMTP_EMAIL = os.getenv("PAYGUARD_SMTP_EMAIL")
SMTP_APP_PASSWORD = os.getenv("PAYGUARD_SMTP_APP_PASSWORD")


password_hasher = PasswordHasher()

OTP_EXPIRY_MINUTES = 5


# ============================================================
# DATABASE
# ============================================================

def get_connection():
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DB_FILE)
    connection.row_factory = sqlite3.Row

    return connection


def init_auth_db():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'customer',
            email_verified INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        )
        """
    )

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS otps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            otp_hash TEXT NOT NULL,
            purpose TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            used INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        )
        """
    )

    connection.commit()
    connection.close()


# ============================================================
# OTP
# ============================================================

def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def send_otp_email(email: str, otp: str, purpose: str):
    if not SMTP_EMAIL or not SMTP_APP_PASSWORD:
        raise HTTPException(
            status_code=500,
            detail="Email service is not configured."
        )

    subject = "PayGuard Email Verification"

    if purpose == "password_reset":
        subject = "PayGuard Password Reset OTP"

    elif purpose == "admin_login":
        subject = "PayGuard Admin Login OTP"

    message = EmailMessage()

    message["From"] = SMTP_EMAIL
    message["To"] = email
    message["Subject"] = subject

    message.set_content(
        f"""
Hello,

Your PayGuard verification code is:

{otp}

This code will expire in {OTP_EXPIRY_MINUTES} minutes.

If you did not request this code, you can safely ignore this email.

PayGuard
Real-Time Digital Payment Fraud Detection
"""
    )

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(
                SMTP_EMAIL,
                SMTP_APP_PASSWORD
            )
            server.send_message(message)

    except Exception as error:
        print("Email sending error:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to send verification email."
        )


def create_and_send_otp(email: str, purpose: str):
    email = email.lower().strip()

    connection = get_connection()

    connection.execute(
        """
        UPDATE otps
        SET used = 1
        WHERE email = ?
        AND purpose = ?
        AND used = 0
        """,
        (email, purpose)
    )

    otp = generate_otp()
    otp_hash = hash_otp(otp)

    expires_at = datetime.utcnow() + timedelta(
        minutes=OTP_EXPIRY_MINUTES
    )

    connection.execute(
        """
        INSERT INTO otps
        (
            email,
            otp_hash,
            purpose,
            expires_at,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            email,
            otp_hash,
            purpose,
            expires_at.isoformat(),
            datetime.utcnow().isoformat()
        )
    )

    connection.commit()
    connection.close()

    send_otp_email(
        email,
        otp,
        purpose
    )


def verify_otp(email: str, otp: str, purpose: str):
    email = email.lower().strip()

    connection = get_connection()

    row = connection.execute(
        """
        SELECT *
        FROM otps
        WHERE email = ?
        AND purpose = ?
        AND used = 0
        ORDER BY id DESC
        LIMIT 1
        """,
        (email, purpose)
    ).fetchone()

    if not row:
        connection.close()

        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP."
        )

    expires_at = datetime.fromisoformat(
        row["expires_at"]
    )

    if datetime.utcnow() > expires_at:
        connection.close()

        raise HTTPException(
            status_code=400,
            detail="OTP has expired."
        )

    if hash_otp(otp) != row["otp_hash"]:
        connection.close()

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP."
        )

    connection.execute(
        "UPDATE otps SET used = 1 WHERE id = ?",
        (row["id"],)
    )

    connection.commit()
    connection.close()

    return True


# ============================================================
# USER MANAGEMENT
# ============================================================

def create_user(
    name: str,
    email: str,
    password: str
):
    email = email.lower().strip()

    connection = get_connection()

    existing = connection.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if existing:
        connection.close()

        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists."
        )

    password_hash = password_hasher.hash(password)

    connection.execute(
        """
        INSERT INTO users
        (
            name,
            email,
            password_hash,
            role,
            email_verified,
            created_at
        )
        VALUES (?, ?, ?, 'customer', 0, ?)
        """,
        (
            name.strip(),
            email,
            password_hash,
            datetime.utcnow().isoformat()
        )
    )

    connection.commit()
    connection.close()


def create_admin_if_needed():
    admin_email = os.getenv("PAYGUARD_ADMIN_EMAIL")
    admin_password = os.getenv("PAYGUARD_ADMIN_PASSWORD")
    admin_name = os.getenv(
        "PAYGUARD_ADMIN_NAME",
        "PayGuard Admin"
    )

    if not admin_email or not admin_password:
        return

    admin_email = admin_email.lower().strip()

    connection = get_connection()

    existing = connection.execute(
        "SELECT id FROM users WHERE email = ?",
        (admin_email,)
    ).fetchone()

    if not existing:

        password_hash = password_hasher.hash(
            admin_password
        )

        connection.execute(
            """
            INSERT INTO users
            (
                name,
                email,
                password_hash,
                role,
                email_verified,
                created_at
            )
            VALUES (?, ?, ?, 'admin', 1, ?)
            """,
            (
                admin_name,
                admin_email,
                password_hash,
                datetime.utcnow().isoformat()
            )
        )

        connection.commit()

    connection.close()


def verify_user_email(email: str):
    email = email.lower().strip()

    connection = get_connection()

    connection.execute(
        """
        UPDATE users
        SET email_verified = 1
        WHERE email = ?
        """,
        (email,)
    )

    connection.commit()
    connection.close()


def get_user(email: str):
    email = email.lower().strip()

    connection = get_connection()

    user = connection.execute(
        """
        SELECT *
        FROM users
        WHERE email = ?
        """,
        (email,)
    ).fetchone()

    connection.close()

    return user


def verify_password(
    password: str,
    password_hash: str
):
    try:
        return password_hasher.verify(
            password_hash,
            password
        )

    except Exception:
        return False


def update_password(
    email: str,
    new_password: str
):
    email = email.lower().strip()

    password_hash = password_hasher.hash(
        new_password
    )

    connection = get_connection()

    connection.execute(
        """
        UPDATE users
        SET password_hash = ?
        WHERE email = ?
        """,
        (
            password_hash,
            email
        )
    )

    connection.commit()
    connection.close()