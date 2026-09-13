# OpportunityOS System Architecture & Agent Design

OpportunityOS is an autonomous AI-powered personal opportunity manager for students built on **Amazon Bedrock**, **Strands Agents**, **AgentCore Runtime**, **DynamoDB**, and **Amazon S3**.

## Core MVP Agent System

OpportunityOS orchestrates four logical agent groups across the opportunity lifecycle:

```text
1. Discovery Agent
   → Discover + Verify + Deduplicate

2. Opportunity Intelligence Agent
   → Eligibility + Relevance + Ranking (5-Factor Scoring)

3. Application Preparation Agent
   → Requirements Analysis + Document Verification + AI Editable Answers

4. Application Agent
   → AgentCore Browser Automation + Human Approval Checkpoint
```

## Core MVP Flow

```text
Student Profile
      ↓
Opportunity Discovery
      ↓
Deduplication
      ↓
AI Eligibility Check
      ↓
5-Factor Opportunity Scoring
      ↓
Personalized Pipeline
      ↓
Application Readiness Analysis
      ↓
AI Answer Preparation
      ↓
Browser-Assisted Form Filling
      ↓
Human Review & Approval
      ↓
Application Submission
      ↓
Application Tracking
```

## AgentCore System Integration

1. **AgentCore Runtime**: Executes Strands Agents concurrently and securely.
2. **AgentCore Memory**: Maintains persistent student profile context, preferences, career goals, application history, and approved answer data.
3. **AgentCore Gateway**: Secure connector interface to external opportunity sources and internal databases.
4. **AgentCore Browser**: Controlled browser automation agent for form navigation and data entry, halting before final submission.
