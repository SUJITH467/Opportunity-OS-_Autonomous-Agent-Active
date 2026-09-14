# OpportunityOS — Production Autonomous AI Agent Application for Student Opportunities

> **Existing platforms help students FIND opportunities. OpportunityOS helps students MOVE opportunities from discovery to completion .**

![Theme Accent](https://img.shields.io/badge/Theme-Electric%20Aqua%20%2342f5e3-00f2fe?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production--Grade%20Working%20Application-brightgreen?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Architecture-AWS%20Multi--Agent%20System-blueviolet?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-Cognito%20JWKS%20%2B%20Human--in--the--Loop-orange?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014%20(App%20Router)-black?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python%203.13-10998e?style=for-the-badge)

OpportunityOS is an autonomous, production-ready AI opportunity execution platform designed for real students. It continuously discovers, deduplicates, verifies, scores, prioritizes, prepares applications, drafts grounded responses, uploads device documents, enforces backend human sign-off, and streams real-time agent execution events across scholarships, internships, hackathons, fellowships, and research grants.

---

## 🚀 Key Production Capabilities

OpportunityOS is built with real backend logic, AWS service drivers, deterministic scoring algorithms, cryptographic deduplication hashing, NIST-compliant security controls, and multi-tenant persistence layers.

### 🌟 Core Capabilities
- 📡 **Live Opportunity Discovery & Connectors**: Live RSS and REST API connectors harvesting opportunities (Devpost, Amazon Careers, Google Student Portal, LFX Mentorship).
- 🔑 **SHA-256 Canonical Deduplication Engine**: Prevents redundant listings across web portals using standard URL cleaning and string normalization:

  **Canonical ID:**

  `OPP-` + `SHA256(clean_url || normalized_org || normalized_title)[:16]`

  > The canonical ID is generated from the cleaned URL, normalized organization name, and normalized opportunity title using SHA-256 hashing.

- 🎯 **Deterministic 5-Factor Match Engine**: Multi-dimensional scoring evaluating Eligibility, Requirements, Skills, Deadline Urgency, and Value:

  **Match Score:**

  `0.35E + 0.25R + 0.15S + 0.15U + 0.10V`

  - **E** = Eligibility
  - **R** = Requirements / Career Relevance
  - **S** = Skills
  - **U** = Deadline Urgency
  - **V** = Opportunity Value
- 🔐 **Amazon Cognito Authentication**: Cognito serves as the authoritative identity provider, while FastAPI validates Cognito-issued JWTs using JWKS (`/.well-known/jwks.json`). The application additionally uses PBKDF2-SHA256 for locally managed recovery-code protection, rate limiting, and MFA-related security controls.
- 🗄️ **Multi-Tenant AWS Persistence & Storage**: AWS DynamoDB and S3 document vault persistence layers with pre-signed GET URLs, paired with a transparent offline development mode.
- 📂 **Native Device File Uploader**: Interactive client-side document uploader with drag-and-drop dropzone, automatic filename extraction, category detection (`RESUME`, `TRANSCRIPT`, `CERTIFICATE`, `RECOMMENDATION`), and local blob preview URLs.
- 🧠 **Grounded AI Answer Generation**: Bedrock AI reasoning engine generating essay answers and application responses grounded strictly in the student's verified profile and document vault (citing `sources_used`).
- 🛡️ **Backend Human Approval Guardrail**: Hardened backend security (`POST /api/applications/{id}/submit`) returning `HTTP 400 Bad Request` if `is_approved` is `False`.
- 📡 **Real-Time Agent SSE Stream & CloudWatch**: Live Server-Sent Events endpoint (`GET /api/agent/events/stream`) and Amazon CloudWatch metric publisher (`PutMetricData`).

---

## 🤖 Agent Architecture

OpportunityOS uses specialized AI agents orchestrated to coordinate the complete opportunity execution lifecycle:

```text
Discovery Agent
      ↓
Verification Agent
      ↓
Deduplication Agent
      ↓
Eligibility & Ranking Agent
      ↓
Application Preparation Agent
      ↓
Human Approval Guardrail
      ↓
Browser Automation / Submission Agent
```

### Multi-Agent Component Breakdown
- 🔎 **Discovery Agent**: Connects to external developer portals, career endpoints, and RSS feeds to ingest raw opportunity listings.
- 🛡️ **Verification Agent**: Validates portal readiness, active deadlines, and canonical link integrity before processing.
- 🔑 **Deduplication Agent**: Generates deterministic SHA-256 canonical identifiers (`OPP-<sha256[:16]>`) to eliminate duplicate cross-portal listings.
- 🧠 **Eligibility & Ranking Agent**: Computes the deterministic 5-factor match score combining student academic metrics, skill sets, deadline urgency, and opportunity value.
- 📄 **Application Preparation Agent**: Synthesizes grounded application responses and essay answers from the student's profile and S3 document vault using AWS Bedrock.
- 🛡️ **Human Approval Guardrail**: Hardened backend security gate enforcing mandatory explicit user approval before any application can transition to submission.
- 🌐 **Browser Automation Agent**: Maps portal form fields, fills structured user details, and stages application state for final submission.

---

## 🎨 Visual Aesthetics & UI Design

OpportunityOS features a dark glassmorphic interface styled with **Electric Aqua (`rgb(66, 245, 227)` / `#42f5e3`)**.

```css
/* Core Design Tokens */
:root {
  --primary: 174 90% 61%;         /* rgb(66, 245, 227) / #42f5e3 */
  --primary-foreground: 222 47% 11%;
  --background: 224 71% 4%;       /* Deep Slate / Midnight Black */
  --card: 222 47% 7%;             /* Translucent Glassmorphic Card */
  --border: 217 33% 17%;
  --glow-aqua: 0 0 20px rgba(66, 245, 227, 0.25);
}
```

### Visual Features
- **Glassmorphic Panels**: Translucent dark cards with backdrop blur (`backdrop-blur-md`).
- **Aqua Glow Accents**: Interactive elements highlighted with glowing borders in `#42f5e3`.
- **Dynamic Animations**: Smooth transitions, loading spinners, modal overlays, and toast notifications.

---

## 🏗️ Production Architecture & Data Flow

```mermaid
flowchart TD
    User["Student / Client User"] -->|Upload Device File / Sign Up| Frontend["Next.js 14 Frontend"]
    Frontend -->|Cognito JWT Auth| API["FastAPI Backend Core"]
    
    subgraph Connectors & Deduplication
        API --> RSS["Devpost RSS & Live Connectors"]
        RSS --> Dedup["Deduplication Agent"]
        Dedup -->|SHA-256 Canonical Hashing| CanonicalIDs["OPP-{SHA256[:16]}"]
    end

    subgraph Intelligence & Scoring
        CanonicalIDs --> ScoreEngine["5-Factor Match Engine"]
        ScoreEngine -->|0.35E + 0.25R + 0.15S + 0.15U + 0.10V| ScoredOpps["Scored Opportunities"]
    end

    subgraph AI Grounding & Execution
        ScoredOpps --> AppAgent["Grounded AI Application Agent"]
        AppAgent -->|Grounding Check| Vault["S3 / Document Vault"]
        AppAgent -->|Draft Answers & Form Fill| PrepState["Needs Review Stage"]
    end

    subgraph Security & Verification
        PrepState --> Guard{"Human Approval Guard"}
        Guard -->|is_approved == False| Block["HTTP 400 Rejection"]
        Guard -->|is_approved == True| Submit["Application Submission"]
    end

    subgraph AWS Persistence & Monitoring
        API --> DynamoDB[("Amazon DynamoDB Tables")]
        API --> S3[("Amazon S3 Vault")]
        API --> SSE["Real-time SSE Stream / CloudWatch Metrics"]
    end
```

---

## 📂 Project Structure

```text
dev hack/
├── frontend/                     # Next.js 14 App Router Frontend
│   ├── app/                      # Application Pages & Layouts
│   │   ├── layout.tsx            # Global Provider & Toast Container
│   │   ├── page.tsx              # Public Landing Page
│   │   ├── dashboard/page.tsx    # Live Student Operations Dashboard
│   │   ├── opportunities/        # Explorer & Custom Add Modal
│   │   ├── profile/page.tsx      # Profile, CGPA & Skill Matrix Editor
│   │   ├── documents/page.tsx    # Native File Uploader & Vault
│   │   ├── pipeline/page.tsx     # Kanban Application Tracker
│   │   ├── applications/[id]/    # Grounded AI Essay Editor & Approval UI
│   │   ├── agent-activity/       # Live SSE Event Stream & Execution Timeline
│   │   ├── settings/page.tsx     # AI Confidence Sliders & Safety Controls
│   │   ├── (auth)/login/         # Login Page with Rate-Limiting Feedback
│   │   └── (auth)/signup/        # Signup Page with Password Strength & Recovery Codes
│   ├── components/               # UI Components & Modals
│   │   ├── layout/               # Header, Sidebar, Navigation
│   │   └── Modals/               # Human Approval Modal, Add Opportunity Modal
│   ├── lib/                      # State & API Client
│   │   ├── store.tsx             # Hybrid LocalStorage + REST API Store
│   │   ├── api.ts                # FastAPI Client & SSE Listener
│   │   └── utils.ts              # Formatters & Class Merge Utilities
│   ├── tailwind.config.js        # Theme Config (Electric Aqua #42f5e3)
│   └── package.json
│
├── backend/                      # Python FastAPI Backend
│   ├── app/                      # Backend Core Package
│   │   ├── main.py               # Server Entrypoint & CORS Setup
│   │   ├── api/                  # REST API Endpoints
│   │   │   ├── auth.py           # Login, Signup, PBKDF2 Recovery & MFA Gating
│   │   │   ├── cognito_verifier.py # Cognito JWKS RSA Key Verification
│   │   │   ├── opportunities.py  # Opportunity Discovery & Search
│   │   │   ├── profile.py        # Student Profile & Skill API
│   │   │   ├── documents.py      # Document Storage & Pre-signed URLs
│   │   │   ├── applications.py   # Application Pipeline & Guardrails
│   │   │   └── agent.py          # Real-time SSE Stream & Execution APIs
│   │   ├── agents/               # Multi-Agent Modules
│   │   │   ├── discovery_agent.py    # Opportunity Portal Connector Agent
│   │   │   ├── verification_agent.py # Link & Portal Integrity Agent
│   │   │   ├── deduplication_agent.py # SHA-256 Canonical Hashing Engine
│   │   │   ├── eligibility_agent.py   # Student Eligibility Checker
│   │   │   ├── ranking_agent.py       # 5-Factor Score Calculation
│   │   │   ├── application_agent.py   # Grounded AI Essay Synthesis
│   │   │   ├── browser_agent.py       # Browser Automation & Form Mapper
│   │   │   └── agent_orchestrator.py  # Multi-Agent Pipeline Coordinator
│   │   ├── repositories/         # Storage Layer
│   │   │   └── database.py       # DynamoDB Multi-Tenant Driver & JSON Fallback
│   │   ├── services/             # Service Drivers
│   │   │   ├── connectors.py     # Live RSS/API Connector Gateway
│   │   │   ├── storage_service.py # S3 Driver & Pre-signed GET URL Generator
│   │   │   └── cloudwatch_service.py # CloudWatch Metric Publisher
│   │   └── models/               # Domain Schemas & Enums
│   │       └── domain.py         # Pydantic v2 Models
│   ├── tests/                    # Pytest Suite
│   │   ├── test_approval_guardrail.py # Approval Enforcement Test
│   │   ├── test_cognito_auth.py       # Cognito Auth & Hashing Test
│   │   ├── test_connectors.py         # Connector Determinism Test
│   │   ├── test_scoring_math.py       # 5-Factor Scoring Formula Test
│   │   └── test_deduplication.py      # SHA-256 Canonical Hashing Test
│   └── requirements.txt          # Python 3.13 Dependencies
│
└── docker-compose.yml            # Container Orchestration
```

---

## 🛠️ Requirements & Environment Setup

### Prerequisites
- **Node.js**: v18.17.0+
- **Python**: v3.13+ (or Python 3.11+)
- **Git**

---

### Step 1: Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
The frontend starts at **`http://localhost:3000`**.

---

### Step 2: Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- **Backend Base URL**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`

---

### Step 3: Pytest Suite Execution

Run the backend test suite:

```bash
cd backend
pytest
```

Expected Output:
```text
====================== 12 passed in 4.62s ======================
```

---

## 🔐 AWS Environment Configuration

To configure environment settings for AWS cloud services, create a `.env` file in `backend/`:

```env
# AWS Region & Environment
AWS_REGION=us-east-1
ENVIRONMENT=development

# Amazon Cognito Authentication
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX

# Amazon DynamoDB & S3 Storage
DYNAMODB_TABLE_PREFIX=OpportunityOS
S3_BUCKET_NAME=opportunity-os-documents-vault

# AWS CloudWatch Monitoring
CLOUDWATCH_LOG_GROUP=/opportunity-os/agent-events
```

> **Note on Production Credentials**: For production deployments, use an IAM role attached to the compute environment (e.g. AWS App Runner, ECS Task Role, or EC2 Instance Profile) rather than long-lived static AWS access keys.

---

## ⚠️ Operational Modes & Verification Status

- **Development Mode**: Local fallback storage and simulated credentials may be used for offline development and testing.
- **Production Mode**: AWS services are mandatory. When `ENVIRONMENT=production`, the application requires Cognito, DynamoDB, S3, and configured AWS resources, and fails closed if required infrastructure is unavailable.

### Verification Status
- **Local Application Verification Complete**: All 15 Next.js App Router pages and FastAPI backend routers are compiled, linted, and verified via automated test suites (12/12 Pytest tests passing).
- **AWS Cloud Deployment**: Local application verification is complete. Live AWS end-to-end deployment and validation are required before claiming full production deployment.

---

## 📡 Key REST Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register student profile and generate recovery code entropy blocks |
| `POST` | `/api/auth/login` | Authenticate through Amazon Cognito and validate/use Cognito-issued access tokens |
| `POST` | `/api/auth/mfa/verify` | Verify MFA authentication code (with dev mode OTP gate) |
| `GET` | `/api/auth/recovery-codes` | Generate 256-bit CSPRNG entropy recovery blocks |
| `GET` | `/api/auth/me` | Fetch verified profile of currently authenticated user |
| `GET` | `/api/opportunities` | Discovered opportunities with search, filter, and match scores |
| `POST` | `/api/opportunities` | Ingest and score custom user-submitted opportunity |
| `GET` | `/api/profile` | Retrieve current student profile & technical skill matrix |
| `POST` | `/api/profile` | Save and sync student profile metrics |
| `POST` | `/api/documents/upload` | Upload device file to S3 / Local Vault with smart category detection |
| `GET` | `/api/applications` | Pipeline applications grouped by status stage |
| `POST` | `/api/applications/{id}/submit` | Guarded submission endpoint (returns 400 if `is_approved` is False) |
| `GET` | `/api/agent/events/stream` | Server-Sent Events (SSE) real-time agent execution stream |
| `POST` | `/api/agent/scan` | Trigger autonomous live connector discovery & deduplication |

---

<p align="center">
  Built for Production · <strong>OpportunityOS</strong>
</p>
