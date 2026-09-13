import json
import asyncio
from typing import List
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.schemas.pydantic_models import AgentActivityResponse, RunDiscoveryRequest
from app.models.domain import AgentEvent
from app.repositories.database import repository
from app.agents.agent_orchestrator import orchestrator

router = APIRouter(prefix="/agent", tags=["Agent"])

@router.get("/activity", response_model=AgentActivityResponse)
def get_agent_activity():
    activities = repository.activities
    return AgentActivityResponse(
        activities=activities,
        total_count=len(activities)
    )

@router.get("/events", response_model=List[AgentEvent])
def get_agent_events():
    return repository.events

@router.get("/events/stream")
async def stream_agent_events():
    """Server-Sent Events (SSE) stream delivering real-time agent audit logs."""
    async def event_generator():
        last_index = 0
        while True:
            current_events = list(repository.events)
            if len(current_events) > last_index:
                new_events = current_events[last_index:]
                last_index = len(current_events)
                for event in new_events:
                    event_data = json.dumps(event.dict())
                    yield f"event: agent_event\ndata: {event_data}\n\n"
            await asyncio.sleep(1.0)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/discover")
def trigger_discovery(payload: RunDiscoveryRequest):
    return orchestrator.run_discovery_pipeline()

