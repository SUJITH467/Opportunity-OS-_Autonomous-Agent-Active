import pytest
from app.models.domain import StudentProfile, Opportunity, OpportunityType, EligibilityResult
from app.agents.ranking_agent import ranking_agent
from app.agents.eligibility_agent import eligibility_agent

def test_deterministic_5_factor_scoring_math():
    student = StudentProfile()
    opp = Opportunity(
        opportunity_id="opp_test_math_01",
        title="AWS Cloud Test Opportunity",
        organization="Amazon Web Services",
        type=OpportunityType.INTERNSHIP,
        description="Testing 5-factor scoring formula.",
        deadline="2026-10-30",
        application_url="https://aws.amazon.com/test",
        eligibility_criteria=["B.Tech", "CGPA >= 7.5"]
    )

    elig = eligibility_agent.check_eligibility(student, opp)
    rank = ranking_agent.rank_opportunity(student, opp, elig)

    # Validate arithmetic formula: 0.35*E + 0.25*R + 0.15*S + 0.15*U + 0.10*V
    expected_score = int(
        0.35 * rank.eligibility_score +
        0.25 * rank.relevance_score +
        0.15 * rank.skill_match_score +
        0.15 * rank.deadline_urgency_score +
        0.10 * rank.opportunity_value_score
    )

    assert rank.overall_score == expected_score
    assert rank.overall_score >= 0 and rank.overall_score <= 100
    assert rank.data_confidence >= 0 and rank.data_confidence <= 100
