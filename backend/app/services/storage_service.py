import os
import logging
from typing import Tuple
import boto3
from app.config import settings

logger = logging.getLogger("OpportunityOS.StorageService")

class StorageService:
    def __init__(self):
        self.s3_client = None
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            try:
                self.s3_client = boto3.client(
                    "s3",
                    region_name=settings.AWS_REGION,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
                )
                logger.info(f"S3 Storage client initialized for bucket {settings.S3_BUCKET_NAME}")
            except Exception as e:
                logger.warning(f"S3 initialization failed: {e}. Falling back to local storage.")

    def upload_file(self, student_id: str, doc_category: str, filename: str, file_bytes: bytes) -> Tuple[str, str]:
        """Uploads document to S3 or local mock directory structure."""
        s3_key = f"students/{student_id}/{doc_category}/{filename}"
        s3_url = f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com/{s3_key}"

        if self.s3_client:
            try:
                self.s3_client.put_object(
                    Bucket=settings.S3_BUCKET_NAME,
                    Key=s3_key,
                    Body=file_bytes,
                    ContentType="application/pdf"
                )
                logger.info(f"Uploaded file to S3: {s3_key}")
                return s3_key, s3_url
            except Exception as e:
                logger.error(f"Failed to upload to S3: {e}")

        # Local fallback simulation
        local_dir = os.path.join(os.getcwd(), "uploads", student_id, doc_category)
        os.makedirs(local_dir, exist_ok=True)
        local_path = os.path.join(local_dir, filename)
        with open(local_path, "wb") as f:
            f.write(file_bytes)
        
        return s3_key, f"/static/uploads/{student_id}/{doc_category}/{filename}"

storage_service = StorageService()

def get_storage_service() -> StorageService:
    return storage_service
