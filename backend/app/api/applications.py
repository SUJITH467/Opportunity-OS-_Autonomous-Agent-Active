from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from app.models.domain import Application, ApplicationStatus, AgentEvent, AgentActivity
from app.schemas.pydantic_models import UpdateApplicationAnswerRequest, ApproveApplicationRequest
from app.repositories.database import repository
from app.agents.agent_orchestrator import orchestrator
from app.services.cloudwatch_service import cloudwatch_service
from app.config import settings

router = APIRouter(prefix="/applications", tags=["Applications"])

VALID_TRANSITIONS = {
    ApplicationStatus.DRAFT: [ApplicationStatus.PREPARING, ApplicationStatus.SHORTLISTED],
    ApplicationStatus.DISCOVERED: [ApplicationStatus.SHORTLISTED, ApplicationStatus.PREPARING],
    ApplicationStatus.SHORTLISTED: [ApplicationStatus.PREPARING, ApplicationStatus.READY_FOR_REVIEW],
    ApplicationStatus.PREPARING: [ApplicationStatus.READY_FOR_REVIEW, ApplicationStatus.AWAITING_APPROVAL],
    ApplicationStatus.READY_FOR_REVIEW: [ApplicationStatus.AWAITING_APPROVAL, ApplicationStatus.FORM_IN_PROGRESS],
    ApplicationStatus.AWAITING_APPROVAL: [ApplicationStatus.READY, ApplicationStatus.SUBMITTING, ApplicationStatus.PREPARING],
    ApplicationStatus.READY: [ApplicationStatus.SUBMITTING, ApplicationStatus.SUBMITTED],
    ApplicationStatus.SUBMITTING: [ApplicationStatus.SUBMITTED, ApplicationStatus.FAILED],
    ApplicationStatus.SUBMITTED: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.WITHDRAWN],
    ApplicationStatus.UNDER_REVIEW: [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
}

@router.get("", response_model=List[Application])
def list_applications():
    return list(repository.applications.values())

@router.get("/{application_id}", response_model=Application)
def get_application(application_id: str):
    app = repository.applications.get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.post("/{application_id}/prepare")
def prepare_application(application_id: str):
    return orchestrator.prepare_and_browser_fill(application_id)

@router.post("/{application_id}/approve")
def approve_application(application_id: str, payload: ApproveApplicationRequest):
    app = repository.applications.get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    now_iso = datetime.utcnow().isoformat()
    app.is_approved = True
    app.approval_timestamp = now_iso
    app.approved_by = payload.approved_by if payload.approved_by else "Student User"
    app.status = ApplicationStatus.READY
    app.updated_at = now_iso

    act = AgentActivity(
        activity_id=f"act_{int(datetime.utcnow().timestamp())}_approved",
        timestamp=datetime.utcnow().strftime("%H:%M"),
        agent_name="Human Approval Guard",
        icon="🛡️",
        summary=f"Human Approval GRANTED by {app.approved_by} for {app.opportunity_title}",
        details={"approved_by": app.approved_by, "timestamp": now_iso}
    )
    repository.activities.insert(0, act)

    evt = AgentEvent(
        event_id=f"evt_{int(datetime.utcnow().timestamp())}_approved",
        user_id=app.student_id,
        agent_name="Human Approval Guard",
        event_type="HUMAN_APPROVAL_GRANTED",
        status="COMPLETED",
        execution_id=f"exec_app_{application_id}",
        application_id=application_id,
        metadata={"approved_by": app.approved_by}
    )
    repository.events.insert(0, evt)
    cloudwatch_service.log_agent_event("Human Approval Guard", "HUMAN_APPROVAL_GRANTED", {"application_id": application_id})

    return {
        "status": "APPROVED",
        "message": f"Application approved by {payload.approved_by} at {app.approval_timestamp}",
        "application": app
    }

@router.post("/{application_id}/submit")
def submit_application(application_id: str):
    app = repository.applications.get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # HARD BACKEND GUARDRAIL: Block submission if user hasn't explicitly approved
    if settings.REQUIRE_HUMAN_APPROVAL and not app.is_approved:
        raise HTTPException(
            status_code=400,
            detail="HUMAN APPROVAL REQUIRED: Submission blocked by OpportunityOS Safety Guardrail. You must explicitly approve this application before dispatching."
        )
    
    now_iso = datetime.utcnow().isoformat()
    app.status = ApplicationStatus.SUBMITTED
    app.submitted_at = now_iso
    app.updated_at = now_iso

    act = AgentActivity(
        activity_id=f"act_{int(datetime.utcnow().timestamp())}_submitted",
        timestamp=datetime.utcnow().strftime("%H:%M"),
        agent_name="Application Execution Agent",
        icon="🚀",
        summary=f"Application SUBMITTED for {app.opportunity_title}",
        details={"submitted_at": now_iso}
    )
    repository.activities.insert(0, act)

    evt = AgentEvent(
        event_id=f"evt_{int(datetime.utcnow().timestamp())}_submitted",
        user_id=app.student_id,
        agent_name="Application Execution Agent",
        event_type="APPLICATION_SUBMITTED",
        status="COMPLETED",
        execution_id=f"exec_sub_{application_id}",
        application_id=application_id,
        metadata={"submitted_at": now_iso}
    )
    repository.events.insert(0, evt)
    cloudwatch_service.put_metric("ApplicationsSubmitted", 1)
    cloudwatch_service.log_agent_event("Application Execution Agent", "APPLICATION_SUBMITTED", {"application_id": application_id})

    return {
        "status": "SUBMITTED",
        "message": f"Successfully submitted application for {app.opportunity_title}!",
        "submitted_at": app.submitted_at
    }

@router.patch("/{application_id}/answer")
def update_generated_answer(application_id: str, payload: UpdateApplicationAnswerRequest):
    app = repository.applications.get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    for ans in app.generated_answers:
        if ans.question_id == payload.question_id:
            ans.answer = payload.answer
            ans.approved = True
            break
            
    return app

