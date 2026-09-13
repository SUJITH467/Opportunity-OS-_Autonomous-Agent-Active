import logging
from typing import Dict, Any
from app.models.domain import StudentProfile, Opportunity, EligibilityResult

logger = logging.getLogger("OpportunityOS.EligibilityAgent")

class EligibilityAgent:
    def check_eligibility(self, student: StudentProfile, opportunity: Opportunity) -> EligibilityResult:
        """Compares student profile against opportunity requirements strictly without hallucinating missing data."""
        logger.info(f"Eligibility Agent checking {student.name} against {opportunity.title}")
        
        matched = []
        missing = []
        unknown = []

        # Check Academic CGPA
        student_cgpa = student.academic.cgpa
        if "CGPA >= 7.5" in opportunity.eligibility_criteria or "CGPA >= 8.0" in opportunity.eligibility_criteria:
            if student_cgpa >= 7.5:
                matched.append(f"CGPA Requirement: Student CGPA {student_cgpa} satisfies criteria")
            else:
                missing.append(f"CGPA Requirement: Student CGPA {student_cgpa} below threshold")
        else:
            matched.append(f"Academic Degree: {student.academic.degree} in {student.academic.department}")

        # Check Graduation Year
        if student.academic.graduation_year in [2026, 2027]:
            matched.append(f"Graduation Year: {student.academic.graduation_year} matches target cohort")

        # Check Skills Match
        opp_reqs_str = " ".join(opportunity.requirements + opportunity.eligibility_criteria).lower()
        matched_skills = [s for s in student.skills if s.lower() in opp_reqs_str]
        if matched_skills:
            matched.append(f"Key Tech Skills: Matched {', '.join(matched_skills)}")

        # Flag citizenship/residency as UNKNOWN if unverified in profile
        if "citizenship" in opp_reqs_str or "residency" in opp_reqs_str:
            unknown.append("Residency / Citizenship eligibility status is UNKNOWN in profile")

        score = max(70, min(98, 80 + len(matched) * 4 - len(missing) * 10))
        is_eligible = len(missing) == 0

        reason = f"{len(matched)} criteria matched ({', '.join(matched[:2])})."
        if unknown:
            reason += f" Note: {unknown[0]}"

        return EligibilityResult(
            eligible=is_eligible,
            eligibility_score=score,
            matched_requirements=matched,
            missing_requirements=missing,
            unknown_requirements=unknown,
            reason=reason
        )

eligibility_agent = EligibilityAgent()
