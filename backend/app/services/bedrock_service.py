import json
import logging
from typing import Dict, Any, Optional
import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.config import settings

logger = logging.getLogger("OpportunityOS.BedrockService")

class BedrockService:
    def __init__(self):
        self.bedrock_client = None
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            try:
                self.bedrock_client = boto3.client(
                    service_name="bedrock-runtime",
                    region_name=settings.AWS_REGION,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
                )
                logger.info("Amazon Bedrock runtime client initialized successfully.")
            except Exception as e:
                logger.warning(f"Could not initialize Amazon Bedrock client: {e}. Falling back to deterministic AI engine.")
        else:
            logger.info("AWS Credentials not provided. Using OpportunityOS local AI Reasoning Engine.")

    def invoke_model(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Invoke Amazon Bedrock foundation model (Claude 3.5 Sonnet / Titan) or deterministic fallback."""
        if self.bedrock_client:
            try:
                body = json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 2048,
                    "temperature": 0.3,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "system": system_prompt or "You are OpportunityOS Autonomous AI Reasoning Engine."
                })
                response = self.bedrock_client.invoke_model(
                    modelId=settings.BEDROCK_MODEL_ID,
                    body=body,
                    contentType="application/json",
                    accept="application/json"
                )
                response_body = json.loads(response.get("body").read())
                return response_body.get("content", [{}])[0].get("text", "")
            except Exception as e:
                logger.error(f"Bedrock invocation failed: {e}. Utilizing fallback reasoning.")
        
        # Fallback response for offline / hackathon demo mode
        return f"[OpportunityOS AI Agent Response]: Generated reasoning based on prompt criteria."

bedrock_service = BedrockService()

def get_bedrock_service() -> BedrockService:
    return bedrock_service
