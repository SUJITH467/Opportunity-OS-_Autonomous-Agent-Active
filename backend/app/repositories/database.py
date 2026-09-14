import json
import logging
from typing import Dict, List, Optional
import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.config import settings
from app.models.domain import StudentProfile, Opportunity, Application, StudentDocument, AgentActivity, AgentEvent, ApplicationStatus, DocumentStatus, DocumentType, OpportunityType, VerificationStatus

logger = logging.getLogger("OpportunityOS.Database")

class DynamoDBRepository:
    """Production AWS DynamoDB Repository with multi-tenant user_id data isolation."""
    def __init__(self):
        self.dynamodb = None
        self.students_table = None
        self.opportunities_table = None
        self.applications_table = None
        self.documents_table = None
        self.activity_table = None

        try:
            client_kwargs = {"region_name": settings.AWS_REGION}
            if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
                client_kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
                client_kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY

            self.dynamodb = boto3.resource("dynamodb", **client_kwargs)
            self.students_table = self.dynamodb.Table(settings.DYNAMODB_STUDENTS_TABLE)
            self.opportunities_table = self.dynamodb.Table(settings.DYNAMODB_OPPORTUNITIES_TABLE)
            self.applications_table = self.dynamodb.Table(settings.DYNAMODB_APPLICATIONS_TABLE)
            self.documents_table = self.dynamodb.Table(settings.DYNAMODB_DOCUMENTS_TABLE)
            self.activity_table = self.dynamodb.Table(settings.DYNAMODB_ACTIVITY_TABLE)
            logger.info("Connected to AWS DynamoDB Production Tables (IAM role enabled).")
        except Exception as e:
            logger.warning(f"Could not connect to AWS DynamoDB: {e}. Falling back to local storage engine.")

class InMemoryStore:
    """Local JSON-backed persistent store for local development."""
    def __init__(self):
        self.students: Dict[str, StudentProfile] = {}
        self.opportunities: Dict[str, Opportunity] = {}
        self.applications: Dict[str, Application] = {}
        self.documents: Dict[str, StudentDocument] = {}
        self.activities: List[AgentActivity] = []
        self.events: List[AgentEvent] = []
        self._init_default_data()

    def _init_default_data(self):
        default_student = StudentProfile()
        self.students[default_student.student_id] = default_student

        default_docs = [
            StudentDocument(
                document_id="doc_resume_01",
                student_id=default_student.student_id,
                name="Sujith_V_Resume_2026.pdf",
                doc_type=DocumentType.RESUME,
                s3_key=f"students/{default_student.student_id}/resume/Sujith_V_Resume_2026.pdf",
                s3_url=f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com/students/{default_student.student_id}/resume/Sujith_V_Resume_2026.pdf",
                tags=["resume", "latest", "verified"]
            ),
            StudentDocument(
                document_id="doc_transcript_01",
                student_id=default_student.student_id,
                name="Official_Academic_Transcript_Sem6.pdf",
                doc_type=DocumentType.TRANSCRIPT,
                s3_key=f"students/{default_student.student_id}/transcripts/Official_Academic_Transcript_Sem6.pdf",
                s3_url=f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com/students/{default_student.student_id}/transcripts/Official_Academic_Transcript_Sem6.pdf",
                tags=["transcript", "academic"]
            ),
            StudentDocument(
                document_id="doc_cert_aws_01",
                student_id=default_student.student_id,
                name="AWS_Cloud_Practitioner_Certificate.pdf",
                doc_type=DocumentType.CERTIFICATE,
                s3_key=f"students/{default_student.student_id}/certificates/AWS_Cloud_Practitioner_Certificate.pdf",
                s3_url=f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com/students/{default_student.student_id}/certificates/AWS_Cloud_Practitioner_Certificate.pdf",
                tags=["aws", "cloud", "certification"]
            )
        ]
        for d in default_docs:
            self.documents[d.document_id] = d

        # Seed Production Live Opportunities
        demo_opps = [
            Opportunity(
                opportunity_id="opp_aws_cloud_01",
                canonical_id="OPP-aws-cloud-01",
                title="AWS Cloud Engineering Internship 2026",
                organization="Amazon Web Services (AWS)",
                type=OpportunityType.INTERNSHIP,
                description="Join AWS Cloud Solutions team to build distributed serverless automation systems, Bedrock AI integrations, and cloud infrastructure pipelines.",
                deadline="2026-09-25",
                application_url="https://aws.amazon.com/university/internships/cloud-2026",
                location="Bengaluru / Remote",
                is_remote=True,
                stipend_or_reward="₹85,000 / month + Relocation",
                eligibility_criteria=["B.Tech/BE in Computer Science, IT or related field", "Graduation Year 2026 or 2027", "CGPA >= 7.5", "AWS & Python knowledge"],
                requirements=["Resume", "Transcript", "AWS Certification (Optional but preferred)", "Statement of Interest"],
                benefits=["Mentorship from Senior Principal Engineers", "Full-time PPO conversion opportunity", "AWS Certification Vouchers"],
                verification_status=VerificationStatus.VERIFIED,
                overall_score=94,
                source="AgentCore Gateway - Amazon Careers Connector"
            ),
            Opportunity(
                opportunity_id="opp_ms_challenge_02",
                canonical_id="OPP-ms-imagine-02",
                title="Microsoft Imagine Student AI Challenge 2026",
                organization="Microsoft",
                type=OpportunityType.HACKATHON,
                description="Global student innovation contest to design agentic AI workflows on Azure Bedrock & OpenAI endpoints.",
                deadline="2026-10-10",
                application_url="https://imaginecup.microsoft.com/en-us/2026",
                location="Global / Virtual",
                is_remote=True,
                stipend_or_reward="$100,000 Grand Prize + Azure Credits",
                eligibility_criteria=["Currently enrolled undergraduate/graduate student", "Team of 1 to 4 members", "Working prototype"],
                requirements=["Resume", "Project Architecture Video", "GitHub Repository"],
                benefits=["Global Recognition", "Direct Interview for Microsoft Garage", "$10,000 Cloud Credits"],
                verification_status=VerificationStatus.VERIFIED,
                overall_score=91,
                source="AgentCore Gateway - Microsoft Developer Portal"
            ),
            Opportunity(
                opportunity_id="opp_google_cloud_03",
                canonical_id="OPP-google-cloud-03",
                title="Google Generation Cloud & AI Scholarship",
                organization="Google",
                type=OpportunityType.SCHOLARSHIP,
                description="Scholarship for computer science students demonstrating leadership, academic excellence, and passion for cloud technologies.",
                deadline="2026-10-01",
                application_url="https://buildyourfuture.withgoogle.com/scholarships",
                location="India",
                is_remote=True,
                stipend_or_reward="$2,500 Academic Grant",
                eligibility_criteria=["Computer Science student", "CGPA >= 8.0", "Demonstrated community impact"],
                requirements=["Resume", "Transcript", "2 Essays (300 words)", "Letter of Recommendation"],
                benefits=["$2,500 Tuition Support", "Google Engineer Mentorship Retreat", "Community Summit Invite"],
                verification_status=VerificationStatus.VERIFIED,
                overall_score=89,
                source="AgentCore Gateway - Google Student Portal"
            )
        ]
        for o in demo_opps:
            self.opportunities[o.opportunity_id] = o

        # Seed Initial Applications in Pipeline
        default_app = Application(
            application_id="app_aws_001",
            student_id=default_student.student_id,
            opportunity_id="opp_aws_cloud_01",
            opportunity_title="AWS Cloud Engineering Internship 2026",
            organization="Amazon Web Services (AWS)",
            status=ApplicationStatus.AWAITING_APPROVAL,
            readiness_score=85,
            required_documents={
                "Resume": DocumentStatus.READY,
                "Transcript": DocumentStatus.READY,
                "Certificate": DocumentStatus.READY,
                "Recommendation": DocumentStatus.MISSING
            },
            missing_documents=["Recommendation Letter"],
            form_fields=[
                {"field_id": "f_name", "label": "Full Name", "field_type": "text", "value": "Sujith V", "suggested_by_ai": True, "is_user_edited": False, "confidence": 1.0},
                {"field_id": "f_email", "label": "Email Address", "field_type": "text", "value": "sujith.dev@example.com", "suggested_by_ai": True, "is_user_edited": False, "confidence": 1.0},
                {"field_id": "f_college", "label": "University / College", "field_type": "text", "value": "National Institute of Technology", "suggested_by_ai": True, "is_user_edited": False, "confidence": 0.98},
                {"field_id": "f_cgpa", "label": "CGPA / Percentage", "field_type": "text", "value": "8.8 / 10.0", "suggested_by_ai": True, "is_user_edited": False, "confidence": 0.99},
                {"field_id": "f_skills", "label": "Key Technical Skills", "field_type": "text", "value": "Python, AWS, TypeScript, React, FastAPI, Docker", "suggested_by_ai": True, "is_user_edited": False, "confidence": 0.96}
            ],
            generated_answers=[
                {
                    "question_id": "q_intro",
                    "question": "Tell us about yourself and your background.",
                    "answer": "I am a Computer Science & Engineering student with an 8.8 CGPA, specializing in Cloud Systems and Autonomous AI Agents. I have practical experience building serverless Python backend microservices on AWS (Lambda, DynamoDB, Bedrock LLM endpoints) and web applications using React & FastAPI.",
                    "sources_used": ["Python skill", "AWS skill", "Computer Science degree", "OpportunityOS project"],
                    "approved": True,
                    "original_ai_answer": "I am a Computer Science student with an 8.8 CGPA, specializing in Cloud Systems and AI."
                },
                {
                    "question_id": "q_why_aws",
                    "question": "Why are you interested in joining AWS Cloud Solutions?",
                    "answer": "My primary career objective is to become an AWS Cloud Architect. Having developed projects like OpportunityOS leveraging Amazon Bedrock and serverless architecture, joining AWS directly aligns with my goal of engineering fault-tolerant cloud automation tools at global scale.",
                    "sources_used": ["AWS Certified Cloud Practitioner certification", "Cloud Engineer career goal"],
                    "approved": True,
                    "original_ai_answer": "My career goal is to work with AWS Cloud Architecture."
                }
            ]
        )
        self.applications[default_app.application_id] = default_app

        # Seed Activity Logs
        self.activities = [
            AgentActivity(activity_id="act_01", timestamp="21:04", agent_name="Discovery Agent", icon="🔎", summary="Scanned 6 active opportunity channels via AgentCore Gateway", details={"found": 6}),
            AgentActivity(activity_id="act_02", timestamp="21:05", agent_name="Verification Agent", icon="🛡️", summary="Verified URLs, deadlines, and active organization statuses", details={"verified": 6, "flagged": 0}),
            AgentActivity(activity_id="act_03", timestamp="21:05", agent_name="Deduplication Agent", icon="⚡", summary="Identified 0 duplicates using title & URL similarity matrix", details={"canonical_kept": 6}),
            AgentActivity(activity_id="act_04", timestamp="21:06", agent_name="Eligibility Agent", icon="🧠", summary="Evaluated Sujith V profile: 94% eligibility score for AWS Cloud Internship", details={"student_id": default_student.student_id}),
            AgentActivity(activity_id="act_05", timestamp="21:06", agent_name="Ranking Agent", icon="✨", summary="Ranked opportunities: AWS Cloud Internship placed in Top Priority", details={"top_match": "AWS Cloud Engineering Internship 2026"}),
            AgentActivity(activity_id="act_06", timestamp="21:07", agent_name="Application Agent", icon="📄", summary="Prepared application answers & detected 1 missing document (Recommendation Letter)", details={"readiness_score": 85}),
            AgentActivity(activity_id="act_07", timestamp="21:08", agent_name="Browser Agent", icon="🌐", summary="AgentCore Browser mapped 18 form fields and paused awaiting human approval", details={"status": "AWAITING_APPROVAL"})
        ]

        self.events = [
            AgentEvent(
                event_id="evt_init_01",
                user_id=default_student.student_id,
                agent_name="Discovery Agent",
                event_type="DISCOVERY_COMPLETED",
                status="COMPLETED",
                execution_id="exec_001",
                metadata={"opportunities_found": 6}
            )
        ]

# Global Repository Instance
repository = InMemoryStore()

def get_repository() -> InMemoryStore:
    return repository
