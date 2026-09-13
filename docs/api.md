# OpportunityOS REST API Specification

## Auth & Profile
- `POST /api/auth/login`: Authenticate student session.
- `GET /api/profile`: Retrieve student master profile.
- `PUT /api/profile`: Update student master profile.

## Opportunities
- `GET /api/opportunities`: List discovered canonical opportunities with filters (`opp_type`, `min_score`, `search`).
- `GET /api/opportunities/{id}`: Get opportunity details, AI breakdown & match explanation.
- `POST /api/opportunities/{id}/save`: Add opportunity to student pipeline.
- `POST /api/opportunities/{id}/analyze`: Run deep eligibility check and score analysis.

## Applications & Approvals
- `GET /api/applications`: List active applications in pipeline.
- `GET /api/applications/{id}`: Fetch application workspace, readiness score, and generated answers.
- `POST /api/applications/{id}/prepare`: Run Application Prep & AgentCore Browser form auto-fill.
- `PATCH /api/applications/{id}/answer`: Edit AI-generated answer response.
- `POST /api/applications/{id}/approve`: Authorize application (records `approved_by` and `approval_timestamp`).
- `POST /api/applications/{id}/submit`: Execute final submission.

## Agent & Documents
- `GET /api/agent/activity`: Retrieve live audit trail of agent executions.
- `POST /api/agent/discover`: Trigger autonomous multi-agent discovery pipeline.
- `GET /api/documents`: List student uploaded documents.
- `POST /api/documents/upload`: Upload file to S3 storage.
