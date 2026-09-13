import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.repositories.database import repository
from app.models.domain import Application, ApplicationStatus

client = TestClient(app)

def test_backend_submission_blocked_without_human_approval():
    # Setup unapproved test application
    app_id = "app_unapproved_test_99"
    unapproved_app = Application(
        application_id=app_id,
        student_id="stu_sujith_001",
        opportunity_id="opp_aws_cloud_01",
        opportunity_title="Unapproved Test Application",
        organization="Test Org",
        status=ApplicationStatus.AWAITING_APPROVAL,
        is_approved=False
    )
    repository.applications[app_id] = unapproved_app

    # Attempt submit without approval
    res = client.post(f"/api/applications/{app_id}/submit")

    # MUST be rejected with HTTP 400 Bad Request
    assert res.status_code == 400
    assert "HUMAN APPROVAL REQUIRED" in res.json()["detail"]

def test_backend_submission_succeeds_after_explicit_approval():
    app_id = "app_approved_test_100"
    approved_app = Application(
        application_id=app_id,
        student_id="stu_sujith_001",
        opportunity_id="opp_aws_cloud_01",
        opportunity_title="Approved Test Application",
        organization="Test Org",
        status=ApplicationStatus.AWAITING_APPROVAL,
        is_approved=False
    )
    repository.applications[app_id] = approved_app

    # 1. Approve
    approve_res = client.post(f"/api/applications/{app_id}/approve", json={"approved_by": "Sujith V"})
    assert approve_res.status_code == 200
    assert repository.applications[app_id].is_approved is True

    # 2. Submit
    submit_res = client.post(f"/api/applications/{app_id}/submit")
    assert submit_res.status_code == 200
    assert submit_res.json()["status"] == "SUBMITTED"
    assert repository.applications[app_id].status == ApplicationStatus.SUBMITTED
