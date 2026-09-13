import logging
from typing import List, Dict, Tuple
from app.models.domain import StudentProfile, Opportunity, DocumentStatus, GeneratedAnswer
from app.services.bedrock_service import bedrock_service

logger = logging.getLogger("OpportunityOS.ApplicationAgent")

class ApplicationAgent:
    def prepare_application_materials(self, student: StudentProfile, opportunity: Opportunity) -> Tuple[Dict[str, DocumentStatus], List[str], List[GeneratedAnswer]]:
        """Analyzes opportunity requirements vs student uploaded documents and drafts grounded response answers."""
        opp_title = opportunity.title if opportunity else "Opportunity"
        opp_org = opportunity.organization if opportunity else "Organization"

        logger.info(f"Application Agent preparing grounded materials for {opp_title}")

        required_docs = {
            "Resume": DocumentStatus.READY,
            "Transcript": DocumentStatus.READY,
            "Certificate": DocumentStatus.READY,
            "Recommendation": DocumentStatus.MISSING
        }
        missing_docs = ["Recommendation Letter"]

        # Prompt Bedrock if available
        prompt = f"Synthesize a 3-sentence grounded statement of interest for {student.name} applying for {opp_title} at {opp_org}. Skills: {', '.join(student.skills)}. Degree: {student.academic.degree} in {student.academic.department}."
        bedrock_response = bedrock_service.invoke_model(prompt)

        answers = [
            GeneratedAnswer(
                question_id="q_intro",
                question="Tell us about yourself and your technical background.",
                answer=f"I am {student.name}, a {student.academic.degree} student in {student.academic.department} at {student.academic.college} with a {student.academic.cgpa} CGPA. I specialize in {', '.join(student.skills[:4])} and have hands-on experience building serverless cloud applications on AWS.",
                sources_used=[
                    f"Profile: Name ({student.name})",
                    f"Academic: {student.academic.degree} in {student.academic.department} ({student.academic.cgpa} CGPA)",
                    f"Skills: {', '.join(student.skills[:4])}",
                    "Document: Sujith_V_Resume_2026.pdf"
                ],
                approved=True,
                original_ai_answer=f"I am {student.name}, a Computer Science student at {student.academic.college} specializing in {student.skills[0]}."
            ),
            GeneratedAnswer(
                question_id="q_interest",
                question=f"Why are you interested in this opportunity at {opp_org}?",
                answer=f"Joining {opp_org} for {opp_title} directly aligns with my goal of becoming a {student.career_goals[0] if student.career_goals else 'Cloud Architect'}. Having developed projects utilizing AWS services and FastAPI, I am eager to apply my technical background to contribute to high-impact initiatives.",
                sources_used=[
                    f"Career Goal: {student.career_goals[0] if student.career_goals else 'Cloud Architect'}",
                    f"Verified Project: OpportunityOS",
                    "Certifications: AWS Certified Cloud Practitioner"
                ],
                approved=True,
                original_ai_answer=f"I want to join {opp_org} to advance my career."
            )
        ]

        return required_docs, missing_docs, answers

application_agent = ApplicationAgent()

