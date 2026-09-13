from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field

class OpportunityType(str, Enum):
    SCHOLARSHIP = "SCHOLARSHIP"
    INTERNSHIP = "INTERNSHIP"
    HACKATHON = "HACKATHON"
    FELLOWSHIP = "FELLOWSHIP"
    COMPETITION = "COMPETITION"
    CERTIFICATION = "CERTIFICATION"
    PROGRAM = "PROGRAM"
    CAREER = "CAREER"

class ApplicationStatus(str, Enum):
    DRAFT = "DRAFT"
    DISCOVERED = "DISCOVERED"
    ELIGIBILITY_CHECKED = "ELIGIBILITY_CHECKED"
    SHORTLISTED = "SHORTLISTED"
    PREPARING = "PREPARING"
    READY_FOR_REVIEW = "READY_FOR_REVIEW"
    READY = "READY"
    FORM_IN_PROGRESS = "FORM_IN_PROGRESS"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    SUBMITTING = "SUBMITTING"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    REJECTED = "REJECTED"
    ACCEPTED = "ACCEPTED"
    WITHDRAWN = "WITHDRAWN"
    FAILED = "FAILED"

class VerificationStatus(str, Enum):
    VERIFIED = "VERIFIED"
    PARTIALLY_VERIFIED = "PARTIALLY_VERIFIED"
    UNKNOWN = "UNKNOWN"
    EXPIRED = "EXPIRED"

class DocumentType(str, Enum):
    RESUME = "RESUME"
    TRANSCRIPT = "TRANSCRIPT"
    CERTIFICATE = "CERTIFICATE"
    PORTFOLIO = "PORTFOLIO"
    RECOMMENDATION = "RECOMMENDATION"
    OTHER = "OTHER"

class DocumentStatus(str, Enum):
    READY = "READY"
    NEEDS_PREPARATION = "NEEDS_PREPARATION"
    MISSING = "MISSING"

class AcademicInfo(BaseModel):
    education_level: str = "Undergraduate"
    degree: str = "B.Tech"
    department: str = "Computer Science & Engineering"
    college: str = "National Institute of Technology"
    graduation_year: int = 2027
    cgpa: float = 8.8
    max_cgpa: float = 10.0

class PreferencesInfo(BaseModel):
    preferred_types: List[OpportunityType] = [
        OpportunityType.INTERNSHIP,
        OpportunityType.HACKATHON,
        OpportunityType.FELLOWSHIP,
        OpportunityType.SCHOLARSHIP
    ]
    preferred_locations: List[str] = ["Remote", "Bengaluru", "Hyderabad", "United States"]
    remote_only: bool = False
    min_match_score: int = 70

AcademicProfile = AcademicInfo
TargetPreferences = PreferencesInfo


class StudentProfile(BaseModel):
    student_id: str = "stu_sujith_001"
    email: str = "sujith.dev@example.com"
    name: str = "Sujith V"
    phone: Optional[str] = "+91 98765 43210"
    location: Optional[str] = "Bengaluru, India"
    academic: AcademicInfo = Field(default_factory=AcademicInfo)
    skills: List[str] = ["Python", "AWS", "TypeScript", "React", "FastAPI", "Docker", "Machine Learning", "Node.js"]
    programming_languages: List[str] = ["Python", "TypeScript", "JavaScript", "C++", "SQL"]
    interests: List[str] = ["Cloud Computing", "Autonomous AI Agents", "Web Development", "Distributed Systems"]
    career_goals: List[str] = ["AWS Cloud Engineer", "AI/ML Solutions Architect", "Full Stack Developer"]
    experience: List[Dict[str, Any]] = [
        {
            "role": "Cloud & AI Research Intern",
            "organization": "TechInnovate Labs",
            "duration": "Jun 2025 - Aug 2025",
            "description": "Built serverless microservices using AWS Lambda, DynamoDB, and Bedrock LLM endpoints."
        }
    ]
    projects: List[Dict[str, Any]] = [
        {
            "title": "OpportunityOS",
            "tech_stack": ["FastAPI", "Next.js", "AWS Bedrock", "DynamoDB"],
            "description": "Autonomous AI agent platform for student opportunity discovery, eligibility verification, and form auto-filling."
        }
    ]
    certifications: List[str] = [
        "AWS Certified Cloud Practitioner",
        "Deep Learning Specialization (Coursera)"
    ]
    preferences: PreferencesInfo = Field(default_factory=PreferencesInfo)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class EligibilityResult(BaseModel):
    eligible: bool = True
    eligibility_score: int = 92
    matched_requirements: List[str] = []
    missing_requirements: List[str] = []
    unknown_requirements: List[str] = []
    reason: str = ""

class RankingScoreBreakdown(BaseModel):
    eligibility_score: int = 92
    relevance_score: int = 95
    skill_match_score: int = 90
    deadline_urgency_score: int = 85
    opportunity_value_score: int = 94
    overall_score: int = 92
    data_confidence: int = 90
    explanation: str = "Your AWS and Python skills strongly match the technical requirements. Your cloud learning goal aligns directly with this opportunity."

class Opportunity(BaseModel):
    opportunity_id: str
    canonical_id: Optional[str] = None
    title: str
    organization: str
    type: OpportunityType
    description: str
    deadline: str
    application_url: str
    location: str = "Remote"
    is_remote: bool = True
    stipend_or_reward: str = "Competitive Stipend / ₹50,000"
    eligibility_criteria: List[str] = []
    requirements: List[str] = []
    benefits: List[str] = []
    source: str = "AgentCore Gateway"
    verification_status: VerificationStatus = VerificationStatus.VERIFIED
    verified_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    eligibility_result: Optional[EligibilityResult] = None
    score_breakdown: Optional[RankingScoreBreakdown] = None
    overall_score: int = 85
    sources_count: int = 1
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class FormField(BaseModel):
    field_id: str
    label: str
    field_type: str = "text"  # text, textarea, select, file
    value: str = ""
    suggested_by_ai: bool = True
    is_user_edited: bool = False
    confidence: float = 0.98

class GeneratedAnswer(BaseModel):
    question_id: str
    question: str
    answer: str
    sources_used: List[str] = Field(default_factory=list)
    approved: bool = False
    original_ai_answer: str

class Application(BaseModel):
    application_id: str
    student_id: str
    opportunity_id: str
    opportunity_title: str
    organization: str
    status: ApplicationStatus = ApplicationStatus.DISCOVERED
    readiness_score: int = 0
    required_documents: Dict[str, DocumentStatus] = Field(default_factory=dict)
    missing_documents: List[str] = Field(default_factory=list)
    form_fields: List[FormField] = Field(default_factory=list)
    generated_answers: List[GeneratedAnswer] = Field(default_factory=list)
    is_approved: bool = False
    approval_timestamp: Optional[str] = None
    approved_by: Optional[str] = None
    submitted_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class StudentDocument(BaseModel):
    document_id: str
    student_id: str
    name: str
    doc_type: DocumentType
    s3_key: str
    s3_url: str
    file_size_bytes: int = 102400
    upload_timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    tags: List[str] = []

class AgentActivity(BaseModel):
    activity_id: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().strftime("%H:%M:%S"))
    iso_timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    agent_name: str
    icon: str = "🔎"
    summary: str
    details: Dict[str, Any] = Field(default_factory=dict)

class AgentEvent(BaseModel):
    event_id: str
    user_id: str
    agent_name: str
    event_type: str
    status: str = "COMPLETED"
    execution_id: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    opportunity_id: Optional[str] = None
    application_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

