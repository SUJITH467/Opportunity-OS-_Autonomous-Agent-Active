"""
Amazon Bedrock AgentCore Runtime Application Entrypoint.
Hosts OpportunityOS Strands Agents on the managed AgentCore Runtime.
Supports:
  - agentcore dev
  - agentcore deploy
  - agentcore status
  - agentcore invoke
"""
import os
import sys
import logging

# Ensure backend root is on sys.path when invoked directly or via CLI
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from bedrock_agentcore import BedrockAgentCoreApp
try:
    from app.agents.strands_orchestrator import run_strands_pipeline
except ImportError:
    from agents.strands_orchestrator import run_strands_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("OpportunityOS.AgentCoreApp")

# Initialize Bedrock AgentCore Application
app = BedrockAgentCoreApp()

@app.entrypoint
async def invoke(payload, context=None):
    """
    Main entrypoint invoked by Amazon Bedrock AgentCore Runtime.
    Dispatches request to the Strands Agent orchestrator.
    """
    logger.info(f"AgentCore Runtime received invocation request: {payload}")
    return await run_strands_pipeline(payload, context)

if __name__ == "__main__":
    port = int(os.environ.get("AGENTCORE_PORT", "8080"))
    logger.info(f"Starting Bedrock AgentCore Runtime server on port {port}...")
    app.run(port=port)
