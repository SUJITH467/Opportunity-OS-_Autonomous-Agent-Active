"""
OpportunityOS Autonomous Agent Orchestrator built with Strands Agents and Amazon Bedrock.
Hosted on Amazon Bedrock AgentCore Runtime.
"""
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from strands import Agent, tool
from strands.models import BedrockModel

from app.config import settings
from app.repositories.database import repository
from app.models.domain import ApplicationStatus, StudentProfile, Opportunity
from app.services.connectors import live_connectors
from app.agents.eligibility_agent import eligibility_agent
from app.agents.ranking_agent import ranking_agent
from app.agents.application_agent import application_agent
from app.agents.browser_agent import browser_agent
from app.agents.deduplication_agent import deduplication_agent
from app.agents.verification_agent import verification_agent
from app.agents.agent_orchestrator import orchestrator

logger = logging.getLogger("OpportunityOS.StrandsOrchestrator")


# ==============================================================================
# AgentCore Gateway & Source Tools
# ==============================================================================
@tool
def gateway_discovery_and_deduplication(keywords: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    AgentCore Gateway tool: fetches live opportunities across external RSS feeds,
    developer portals, and API endpoints, validates them, and applies SHA-256 canonical deduplication.
    """
    logger.info("Strands Agent calling AgentCore Gateway connector...")
    raw_opps = live_connectors.fetch_live_opportunities()
    verified_opps = verification_agent.verify_opportunities(raw_opps)
    canonical_opps = deduplication_agent.deduplicate(verified_opps)
    
    for opp in canonical_opps:
        repository.opportunities[opp.opportunity_id] = opp

    return {
        "status": "success",
        "channels_scanned": len(live_connectors.sources),
        "discovered_count": len(canonical_opps),
        "sample_opportunities": [
            {"id": o.opportunity_id, "title": o.title, "org": o.organization}
            for o in canonical_opps[:3]
        ]
    }


# ==============================================================================
# Eligibility & 5-Factor Ranking Tools
# ==============================================================================
@tool
def evaluate_student_eligibility_and_ranking(student_id: str = "stu_sujith_001") -> Dict[str, Any]:
    """
    Evaluates student profile against all discovered opportunities using the deterministic
    5-factor scoring engine (35% Eligibility + 25% Career Relevance + 15% Skill Match + 15% Urgency + 10% Value).
    """
    logger.info(f"Strands Agent evaluating eligibility and ranking for student {student_id}")
    student = repository.students.get(student_id) or list(repository.students.values())[0]
    
    ranked_results = []
    top_score = 0
    top_title = ""

    for opp in repository.opportunities.values():
        elig = eligibility_agent.check_eligibility(student, opp)
        rank = ranking_agent.rank_opportunity(student, opp, elig)
        opp.eligibility_result = elig
        opp.score_breakdown = rank
        opp.overall_score = rank.overall_score
        
        if rank.overall_score > top_score:
            top_score = rank.overall_score
            top_title = opp.title
            
        ranked_results.append({
            "opportunity_id": opp.opportunity_id,
            "title": opp.title,
            "score": rank.overall_score,
            "eligible": elig.eligible
        })

    return {
        "status": "success",
        "evaluated_count": len(ranked_results),
        "top_match_title": top_title,
        "top_match_score": top_score
    }


# ==============================================================================
# AgentCore Browser & Form Mapping Tools
# ==============================================================================
@tool
def prepare_and_browser_autofill(application_id: str, student_id: str = "stu_sujith_001") -> Dict[str, Any]:
    """
    Synthesizes grounded application responses using Bedrock AI, analyzes document readiness,
    and runs AgentCore Browser form mapping. Halts at AWAITING_APPROVAL checkpoint for human sign-off.
    """
    logger.info(f"Strands Agent executing preparation and AgentCore Browser mapping for {application_id}")
    return orchestrator.prepare_and_browser_fill(application_id, student_id)


# ==============================================================================
# Human Approval Guardrail Tool
# ==============================================================================
@tool
def check_human_approval_guardrail(application_id: str) -> Dict[str, Any]:
    """
    Enforces the backend safety guardrail: verifies whether the application has received explicit
    human authorization before submission is allowed.
    """
    app = repository.applications.get(application_id)
    if not app:
        return {"approved": False, "error": "Application not found"}
    
    return {
        "application_id": application_id,
        "is_approved": app.is_approved,
        "status": app.status.value if hasattr(app.status, "value") else str(app.status),
        "approved_by": app.approved_by,
        "approval_timestamp": app.approval_timestamp,
        "submission_allowed": app.is_approved
    }


# ==============================================================================
# Strands Agent Instantiation with Amazon Bedrock
# ==============================================================================
bedrock_model = BedrockModel(
    model_id=settings.BEDROCK_MODEL_ID,
    region_name=settings.AWS_REGION
)

SYSTEM_PROMPT = """You are OpportunityOS Autonomous Multi-Agent Orchestrator, powered by Strands Agents and Amazon Bedrock.
You coordinate:
1. Opportunity Discovery via AgentCore Gateway connectors (RSS feeds, developer portals, APIs).
2. SHA-256 canonical deduplication and integrity verification.
3. Deterministic 5-factor scoring (Eligibility, Career Relevance, Skills, Urgency, Opportunity Value).
4. Grounded AI essay/statement drafting based on the student's verified profile and document vault.
5. Controlled form-field mapping via AgentCore Browser automation.
6. MANDATORY HUMAN APPROVAL GUARDRAIL: You pause and await explicit human sign-off before application dispatch. You NEVER bypass user approval."""

strands_agent = Agent(
    model=bedrock_model,
    tools=[
        gateway_discovery_and_deduplication,
        evaluate_student_eligibility_and_ranking,
        prepare_and_browser_autofill,
        check_human_approval_guardrail
    ],
    system_prompt=SYSTEM_PROMPT
)


# ==============================================================================
# AgentCore Runtime Execution Dispatcher
# ==============================================================================
async def run_strands_pipeline(payload: Any, context: Optional[Any] = None) -> Dict[str, Any]:
    """
    Main invocation handler for Bedrock AgentCore Runtime.
    Dispatches to appropriate multi-agent tool pipeline based on request action.
    """
    if isinstance(payload, str):
        import json
        try:
            payload = json.loads(payload)
        except Exception:
            payload = {"action": "query", "query": payload}
    
    if not isinstance(payload, dict):
        payload = {}

    action = payload.get("action", "discover")
    student_id = payload.get("student_id", "stu_sujith_001")
    application_id = payload.get("application_id", "app_aws_001")

    logger.info(f"AgentCore Runtime executing action '{action}' for student {student_id}")

    if action in ("discover", "scan"):
        gateway_res = gateway_discovery_and_deduplication()
        rank_res = evaluate_student_eligibility_and_ranking(student_id)
        return {
            "status": "success",
            "action": action,
            "gateway_result": gateway_res,
            "ranking_result": rank_res,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    elif action in ("prepare", "browser_fill"):
        prep_res = prepare_and_browser_autofill(application_id, student_id)
        return {
            "status": "success",
            "action": action,
            "application_id": application_id,
            "browser_result": prep_res,
            "human_approval_required": True,
            "timestamp": datetime.utcnow().isoformat()
        }

    elif action == "check_approval":
        return check_human_approval_guardrail(application_id)

    elif action == "query":
        # Natural language query through the Strands Agent
        query_text = payload.get("query", "Summarize discovered opportunities and top matches.")
        agent_response = strands_agent(query_text)
        return {
            "status": "success",
            "action": "query",
            "response": str(agent_response),
            "timestamp": datetime.utcnow().isoformat()
        }

    else:
        # Default: execute full discovery & ranking pipeline
        return orchestrator.run_discovery_pipeline(student_id)
