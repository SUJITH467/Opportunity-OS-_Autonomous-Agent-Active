from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr
from app.models.domain import (
    StudentProfile, Opportunity, Application, StudentDocument, AgentActivity,
    OpportunityType, ApplicationStatus
)

class AuthLoginRequest(BaseModel):
    email: str
    password: str

class AuthSignupRequest(BaseModel):
    email: str
    password: str
    name: str
    college: Optional[str] = "National Institute of Technology"
    degree: Optional[str] = "B.Tech"
    department: Optional[str] = "Computer Science & Engineering"
    graduation_year: Optional[int] = 2027
    cgpa: Optional[float] = 8.8

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    student: StudentProfile


class OpportunityFilter(BaseModel):
    type: Optional[OpportunityType] = None
    min_score: Optional[int] = None
    remote_only: Optional[bool] = None
    search_query: Optional[str] = None

class CreateApplicationRequest(BaseModel):
    opportunity_id: str

class UpdateApplicationAnswerRequest(BaseModel):
    question_id: str
    answer: str

class ApproveApplicationRequest(BaseModel):
    approved_by: str = "Sujith V"
    notes: Optional[str] = "Checked and approved for final submission."

class RunDiscoveryRequest(BaseModel):
    force_refresh: bool = False
    source_keywords: Optional[List[str]] = None

class AgentActivityResponse(BaseModel):
    activities: List[AgentActivity]
    total_count: int

class GeneralAPIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
