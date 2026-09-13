import pytest
from app.services.connectors import live_connectors

def test_canonical_id_generation_is_deterministic():
    cid1 = live_connectors.generate_canonical_id("https://aws.amazon.com/internships", "Amazon", "AWS Cloud Internship")
    cid2 = live_connectors.generate_canonical_id("https://aws.amazon.com/internships", "Amazon", "AWS Cloud Internship")
    cid3 = live_connectors.generate_canonical_id("https://microsoft.com/imagine", "Microsoft", "Imagine Cup")

    assert cid1.startswith("OPP-")
    assert cid1 == cid2
    assert cid1 != cid3

def test_live_connector_opportunity_fetch():
    opps = live_connectors.fetch_live_opportunities()
    assert len(opps) > 0
    first_opp = opps[0]
    assert first_opp.title
    assert first_opp.organization
    assert first_opp.application_url.startswith("http")
    assert first_opp.canonical_id.startswith("OPP-")
