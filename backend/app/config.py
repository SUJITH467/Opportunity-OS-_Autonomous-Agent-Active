import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "OpportunityOS API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment & Demo Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "False").lower() in ("true", "1", "t")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Amazon Cognito Authentication
    COGNITO_USER_POOL_ID: Optional[str] = os.getenv("COGNITO_USER_POOL_ID", None)
    COGNITO_CLIENT_ID: Optional[str] = os.getenv("COGNITO_CLIENT_ID", None)
    COGNITO_REGION: str = os.getenv("COGNITO_REGION", "us-east-1")
    
    # Security Fallback
    JWT_SECRET: str = os.getenv("JWT_SECRET", "opportunityos-production-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # AWS Settings
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID", None)
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY", None)
    
    # Amazon Bedrock
    BEDROCK_MODEL_ID: str = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20241022-v2:0")
    BEDROCK_EMBEDDING_MODEL_ID: str = os.getenv("BEDROCK_EMBEDDING_MODEL_ID", "amazon.titan-embed-text-v2:0")
    
    # DynamoDB Tables
    DYNAMODB_STUDENTS_TABLE: str = os.getenv("DYNAMODB_STUDENTS_TABLE", "OpportunityOS_Students")
    DYNAMODB_OPPORTUNITIES_TABLE: str = os.getenv("DYNAMODB_OPPORTUNITIES_TABLE", "OpportunityOS_Opportunities")
    DYNAMODB_APPLICATIONS_TABLE: str = os.getenv("DYNAMODB_APPLICATIONS_TABLE", "OpportunityOS_Applications")
    DYNAMODB_DOCUMENTS_TABLE: str = os.getenv("DYNAMODB_DOCUMENTS_TABLE", "OpportunityOS_Documents")
    DYNAMODB_ACTIVITY_TABLE: str = os.getenv("DYNAMODB_ACTIVITY_TABLE", "OpportunityOS_AgentActivity")
    
    # S3 Storage
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "opportunityos-student-documents-prod")
    
    # CloudWatch Monitoring
    CLOUDWATCH_LOG_GROUP: str = os.getenv("CLOUDWATCH_LOG_GROUP", "/aws/opportunityos/production")
    
    # CORS Origins
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
