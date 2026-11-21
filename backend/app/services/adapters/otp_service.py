import abc
import random
import time
from typing import Tuple
from app.core.config import settings

class BaseOtpService(abc.ABC):
    @abc.abstractmethod
    def send_otp(self, phone: str) -> Tuple[bool, str, str, str]:
        """Returns: (success, session_id, message, demo_otp_hint)"""
        pass

    @abc.abstractmethod
    def verify_otp(self, phone: str, otp: str, session_id: str = None) -> Tuple[bool, str]:
        """Returns: (is_valid, error_or_success_message)"""
        pass

class MockOtpService(BaseOtpService):
    def __init__(self):
        # In-memory storage for development / demo OTPs
        self._otps = {}

    def send_otp(self, phone: str) -> Tuple[bool, str, str, str]:
        clean_phone = phone.replace("+91", "").replace(" ", "").strip()
        # Default mock OTP for simple demo: 123456
        generated_otp = "123456"
        session_id = f"mock-sess-{clean_phone}-{int(time.time())}"
        self._otps[clean_phone] = generated_otp
        
        return (
            True,
            session_id,
            "OTP sent successfully. In demo mode, use 123456.",
            generated_otp
        )

    def verify_otp(self, phone: str, otp: str, session_id: str = None) -> Tuple[bool, str]:
        clean_phone = phone.replace("+91", "").replace(" ", "").strip()
        # Always allow 123456 for any phone in demo mode
        if otp == "123456":
            return (True, "OTP verified successfully (Demo bypass).")
        
        stored_otp = self._otps.get(clean_phone)
        if stored_otp and stored_otp == otp:
            return (True, "OTP verified successfully.")
            
        return (False, "Invalid OTP. For demo mode, please enter 123456.")

class FirebaseOtpService(BaseOtpService):
    """
    Live Firebase Phone Authentication adapter interface.
    To activate: Set FIREBASE_AUTH_MODE=live and provide Firebase Admin credentials in .env.
    """
    def __init__(self):
        pass

    def send_otp(self, phone: str) -> Tuple[bool, str, str, str]:
        # Production Firebase Client SDK triggers phone verification via reCAPTCHA
        # Backend verifies client ID token or coordinates via Firebase Admin SDK
        raise NotImplementedError("Live Firebase requires FIREBASE_PROJECT_ID credentials.")

    def verify_otp(self, phone: str, otp: str, session_id: str = None) -> Tuple[bool, str]:
        raise NotImplementedError("Live Firebase requires FIREBASE_PROJECT_ID credentials.")

def get_otp_service() -> BaseOtpService:
    if settings.FIREBASE_AUTH_MODE == "live":
        return FirebaseOtpService()
    return MockOtpService()
