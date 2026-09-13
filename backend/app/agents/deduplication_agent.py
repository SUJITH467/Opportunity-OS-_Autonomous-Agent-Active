import hashlib
import logging
import re
from typing import List
from app.models.domain import Opportunity

logger = logging.getLogger("OpportunityOS.DeduplicationAgent")

class DeduplicationAgent:
    def deduplicate(self, opportunities: List[Opportunity]) -> List[Opportunity]:
        """Eliminates redundant postings across multiple sources using SHA-256 canonical hashing."""
        logger.info(f"Deduplication Agent scanning {len(opportunities)} items...")
        seen_keys = set()
        deduped = []

        for opp in opportunities:
            if opp.canonical_id:
                key = opp.canonical_id
            else:
                clean_url = re.sub(r'https?://(www\.)?', '', opp.application_url.strip().lower()).rstrip('/')
                normalized_org = re.sub(r'[^a-z0-9]', '', opp.organization.strip().lower())
                normalized_title = re.sub(r'[^a-z0-9]', '', opp.title.strip().lower())
                hash_str = f"{clean_url}|{normalized_org}|{normalized_title}"
                key = f"OPP-{hashlib.sha256(hash_str.encode('utf-8')).hexdigest()[:16]}"

            if key not in seen_keys:
                seen_keys.add(key)
                opp.canonical_id = key
                deduped.append(opp)
            else:
                logger.info(f"Merged duplicate listing into canonical ID {key}: {opp.title}")

        return deduped

deduplication_agent = DeduplicationAgent()

