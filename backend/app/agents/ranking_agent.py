import logging
from app.models.domain import StudentProfile, Opportunity, RankingScoreBreakdown, EligibilityResult

logger = logging.getLogger("OpportunityOS.RankingAgent")

class RankingAgent:
    def rank_opportunity(self, student: StudentProfile, opportunity: Opportunity, eligibility: EligibilityResult) -> RankingScoreBreakdown:
        """Calculates multi-factor weighted score and natural language explanation.
        Formula: 35% Eligibility + 25% Career Relevance + 15% Skill Match + 15% Deadline Urgency + 10% Value
        """
        logger.info(f"Ranking Agent scoring {opportunity.title}")
        
        eligibility_score = eligibility.eligibility_score
        relevance_score = 95 if any(g.lower() in opportunity.title.lower() or g.lower() in opportunity.description.lower() for g in student.career_goals) else 85
        skill_match_score = 92 if any(s.lower() in opportunity.description.lower() for s in student.skills) else 80
        deadline_urgency_score = 88
        opportunity_value_score = 94

        overall = int(
            (eligibility_score * 0.35) +
            (relevance_score * 0.25) +
            (skill_match_score * 0.15) +
            (deadline_urgency_score * 0.15) +
            (opportunity_value_score * 0.10)
        )

        explanation = (
            f"Your {student.skills[0]} and {student.skills[1]} skills strongly match the technical requirements. "
            f"Your career goal of '{student.career_goals[0]}' aligns directly with this {opportunity.type.value.casefold()} opportunity."
        )

        return RankingScoreBreakdown(
            eligibility_score=eligibility_score,
            relevance_score=relevance_score,
            skill_match_score=skill_match_score,
            deadline_urgency_score=deadline_urgency_score,
            opportunity_value_score=opportunity_value_score,
            overall_score=overall,
            explanation=explanation
        )

ranking_agent = RankingAgent()
