from fastapi import APIRouter
from app.repositories.database import repository

router = APIRouter(prefix="/approvals", tags=["Approvals"])

@router.get("")
def list_pending_approvals():
    pending = [
        app for app in repository.applications.values()
        if app.status in ["AWAITING_APPROVAL", "FORM_IN_PROGRESS"] or not app.is_approved
    ]
    return pending
