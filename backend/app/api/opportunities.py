from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.domain import Opportunity, OpportunityType, Application, ApplicationStatus
from app.repositories.database import repository
from app.agents.eligibility_agent import eligibility_agent
from app.agents.ranking_agent import ranking_agent

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])

@router.get("", response_model=List[Opportunity])
def list_opportunities(
    opp_type: Optional[OpportunityType] = None,
    min_score: Optional[int] = Query(None, ge=0, le=100),
    search: Optional[str] = None
):
    results = list(repository.opportunities.values())
    if opp_type:
        results = [o for o in results if o.type == opp_type]
    if min_score:
        results = [o for o in results if o.overall_score >= min_score]
    if search:
        s = search.lower()
        results = [o for o in results if s in o.title.lower() or s in o.organization.lower() or s in o.description.lower()]
    
    # Sort by overall score descending
    results.sort(key=lambda x: x.overall_score, reverse=True)
    return results

@router.post("", response_model=Opportunity)
def create_opportunity(opp: Opportunity):
    if not opp.opportunity_id:
        import time
        opp.opportunity_id = f"opp_custom_{int(time.time())}"
    repository.opportunities[opp.opportunity_id] = opp
    return opp

@router.get("/{opportunity_id}", response_model=Opportunity)
def get_opportunity(opportunity_id: str):
    opp = repository.opportunities.get(opportunity_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    student = repository.students["stu_sujith_001"]
    if not opp.eligibility_result:
        opp.eligibility_result = eligibility_agent.check_eligibility(student, opp)
    if not opp.score_breakdown:
        opp.score_breakdown = ranking_agent.rank_opportunity(student, opp, opp.eligibility_result)
    
    return opp

@router.post("/{opportunity_id}/save")
def save_opportunity_to_pipeline(opportunity_id: str):
    opp = repository.opportunities.get(opportunity_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    student = repository.students["stu_sujith_001"]
    
    # Check existing application
    for app in repository.applications.values():
        if app.opportunity_id == opportunity_id:
            return {"status": "exists", "application": app}
            
    app_id = f"app_{opportunity_id}_{int(repository.applications.__len__() + 1)}"
    new_app = Application(
        application_id=app_id,
        student_id=student.student_id,
        opportunity_id=opp.opportunity_id,
        opportunity_title=opp.title,
        organization=opp.organization,
        status=ApplicationStatus.SHORTLISTED,
        readiness_score=75
    )
    repository.applications[app_id] = new_app
    return {"status": "created", "application": new_app}

@router.post("/{opportunity_id}/analyze")
def analyze_opportunity(opportunity_id: str):
    opp = repository.opportunities.get(opportunity_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    student = repository.students["stu_sujith_001"]
    elig = eligibility_agent.check_eligibility(student, opp)
    rank = ranking_agent.rank_opportunity(student, opp, elig)
    opp.eligibility_result = elig
    opp.score_breakdown = rank
    return {"eligibility": elig, "ranking": rank}
