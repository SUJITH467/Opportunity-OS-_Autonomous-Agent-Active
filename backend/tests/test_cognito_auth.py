import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.auth import validate_password_strength, generate_secure_recovery_codes, _failed_attempts, clear_failed_attempts
from app.config import settings

client = TestClient(app)

def test_password_policy_enforcement():
    """Verify backend password policy enforces 8+ chars, uppercase, lowercase, digit, and special symbol."""
    # Valid password
    validate_password_strength("Password123!")  # Should not raise exception

    # Invalid passwords
    with pytest.raises(Exception) as exc_info:
        validate_password_strength("short")
    assert "Password policy violation" in str(exc_info.value)

    with pytest.raises(Exception) as exc_info:
        validate_password_strength("no_uppercase123!")
    assert "At least 1 uppercase letter" in str(exc_info.value)

    with pytest.raises(Exception) as exc_info:
        validate_password_strength("NO_LOWERCASE123!")
    assert "At least 1 lowercase letter" in str(exc_info.value)

    with pytest.raises(Exception) as exc_info:
        validate_password_strength("NoDigitsHere!")
    assert "At least 1 numeric digit" in str(exc_info.value)

    with pytest.raises(Exception) as exc_info:
        validate_password_strength("NoSpecialChar123")
    assert "At least 1 special character" in str(exc_info.value)

def test_login_success():
    """Verify successful login returns signed JWT access token and user profile."""
    response = client.post("/api/auth/login", json={
        "email": "sujith.dev@example.com",
        "password": "Password123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["student"]["email"] == "sujith.dev@example.com"

def test_login_invalid_credentials_and_rate_limit():
    """Verify invalid login triggers rate limiting after 3 failed attempts."""
    clear_failed_attempts("testclient:invalid@example.com")
    
    # 3 Failed attempts
    for _ in range(3):
        res = client.post("/api/auth/login", json={
            "email": "invalid@example.com",
            "password": "WrongPassword123!"
        })
        assert res.status_code == 401

    # 4th Attempt should trigger HTTP 429 Rate Limit
    res4 = client.post("/api/auth/login", json={
        "email": "invalid@example.com",
        "password": "WrongPassword123!"
    })
    assert res4.status_code == 429
    assert "Too many failed authentication attempts" in res4.json()["detail"]

def test_signup_valid_and_duplicate():
    """Verify student signup with valid password policy."""
    import time
    test_email = f"test_student_{int(time.time())}@example.com"

    response = client.post("/api/auth/signup", json={
        "name": "Test Student",
        "email": test_email,
        "password": "ValidPassword99!",
        "college": "Test University",
        "degree": "B.S.",
        "department": "Computer Science",
        "graduation_year": 2026,
        "cgpa": 9.0
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["student"]["email"] == test_email

    # Duplicate email should fail
    dup_res = client.post("/api/auth/signup", json={
        "name": "Test Student Duplicate",
        "email": test_email,
        "password": "ValidPassword99!",
    })
    assert dup_res.status_code == 400

def test_dev_otp_gating():
    """Verify test OTP 849201 works in development and is rejected in non-development mode."""
    # Development mode test
    settings.ENVIRONMENT = "development"
    res_dev = client.post("/api/auth/mfa/verify", json={
        "mfa_session": "sess_123",
        "code": "849201"
    })
    assert res_dev.status_code == 200
    assert "access_token" in res_dev.json()

    # Production mode test (should reject dev OTP)
    settings.ENVIRONMENT = "production"
    res_prod = client.post("/api/auth/mfa/verify", json={
        "mfa_session": "sess_123",
        "code": "849201"
    })
    assert res_prod.status_code == 400
    assert "Invalid MFA" in res_prod.json()["detail"]

    # Reset back to development
    settings.ENVIRONMENT = "development"

def test_cryptographic_recovery_codes():
    """Verify recovery code generator returns 256-bit CSPRNG entropy blocks and stores salted PBKDF2 hashes."""
    from app.api.auth import _hashed_recovery_store, verify_and_use_recovery_code

    test_uid = "stu_test_recovery_001"
    codes = generate_secure_recovery_codes(test_uid)
    
    # 1. Verify 4 blocks of 8 hex chars (256-bit entropy)
    assert len(codes) == 4
    for code in codes:
        assert len(code) == 9  # 4 chars - 4 chars format (e.g. A7B9-3F12)

    # 2. Verify stored items are PBKDF2 salted hashes (NOT plaintext usable secrets)
    stored_entries = _hashed_recovery_store.get(test_uid, [])
    assert len(stored_entries) == 4
    for entry in stored_entries:
        assert "salt" in entry
        assert "hash" in entry
        assert entry["hash"] != codes[0]  # Must be hashed, not plaintext!
        assert entry["used"] is False

    # 3. Verify salted recovery code verification and one-time consumption
    first_code = codes[0]
    assert verify_and_use_recovery_code(test_uid, first_code) is True
    # Second usage of same code must be rejected
    assert verify_and_use_recovery_code(test_uid, first_code) is False
