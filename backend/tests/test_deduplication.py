import pytest
import hashlib
import re
from app.models.domain import Opportunity, OpportunityType, VerificationStatus
from app.agents.deduplication_agent import deduplication_agent

def test_deduplication_sha256_canonical_hashing():
    opp1 = Opportunity(
        opportunity_id="1",
        title="AWS Cloud Solutions Internship 2026",
        organization="Amazon Web Services (AWS)",
        type=OpportunityType.INTERNSHIP,
        description="Internship opportunity",
        deadline="2026-10-01",
        application_url="https://www.aws.amazon.com/university/cloud-2026/",
        verification_status=VerificationStatus.VERIFIED
    )

    opp2 = Opportunity(
        opportunity_id="2",
        title="aws cloud solutions internship 2026!!",
        organization="amazon web services aws",
        type=OpportunityType.INTERNSHIP,
        description="Duplicate entry with slight casing/punctuation differences",
        deadline="2026-10-01",
        application_url="http://aws.amazon.com/university/cloud-2026",
        verification_status=VerificationStatus.VERIFIED
    )

    opp3 = Opportunity(
        opportunity_id="3",
        title="Google Generation AI Scholarship",
        organization="Google",
        type=OpportunityType.SCHOLARSHIP,
        description="Distinct scholarship opportunity",
        deadline="2026-10-15",
        application_url="https://buildyourfuture.withgoogle.com/scholarships",
        verification_status=VerificationStatus.VERIFIED
    )

    deduped = deduplication_agent.deduplicate([opp1, opp2, opp3])

    # Should reduce 3 postings to 2 unique postings
    assert len(deduped) == 2
    
    # Verify SHA-256 format and canonical ID match
    assert deduped[0].canonical_id.startswith("OPP-")
    assert deduped[0].canonical_id == deduped[1].canonical_id or deduped[0].title == opp1.title
    
    # Calculate exact expected SHA-256 hash for opp1
    clean_url = "aws.amazon.com/university/cloud-2026"
    norm_org = "amazonwebservicesaws"
    norm_title = "awscloudsolutionsinternship2026"
    expected_hash = hashlib.sha256(f"{clean_url}|{norm_org}|{norm_title}".encode('utf-8')).hexdigest()[:16]
    expected_cid = f"OPP-{expected_hash}"

    assert opp1.canonical_id == expected_cid
