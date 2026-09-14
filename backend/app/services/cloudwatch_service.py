import logging
import time
from typing import Dict, Any, Optional
import boto3
from app.config import settings

logger = logging.getLogger("OpportunityOS.CloudWatch")

class CloudWatchService:
    def __init__(self):
        self.cw_client = None
        self.logs_client = None

        try:
            client_kwargs = {"region_name": settings.AWS_REGION}
            if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
                client_kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
                client_kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY

            self.cw_client = boto3.client("cloudwatch", **client_kwargs)
            self.logs_client = boto3.client("logs", **client_kwargs)
            logger.info("AWS CloudWatch metrics and logs client initialized (IAM role enabled).")
        except Exception as e:
            logger.warning(f"Could not initialize AWS CloudWatch client: {e}")

    def put_metric(self, metric_name: str, value: float, unit: str = "Count", dimensions: Optional[Dict[str, str]] = None):
        """Publish custom operational metric to CloudWatch."""
        logger.info(f"[CloudWatch Metric] {metric_name}: {value} {unit} | Dimensions: {dimensions}")

        if not self.cw_client:
            return

        try:
            dim_list = [{"Name": k, "Value": v} for k, v in (dimensions or {}).items()]
            self.cw_client.put_metric_data(
                Namespace="OpportunityOS/Agents",
                MetricData=[
                    {
                        "MetricName": metric_name,
                        "Dimensions": dim_list,
                        "Timestamp": time.time(),
                        "Value": value,
                        "Unit": unit,
                    }
                ],
            )
        except Exception as e:
            logger.error(f"Failed to record CloudWatch metric '{metric_name}': {e}")

    def log_agent_event(self, agent_name: str, event_type: str, details: Dict[str, Any]):
        """Publish structured agent operational audit log to CloudWatch Logs."""
        log_msg = f"[AGENT_EVENT] {agent_name} -> {event_type} | Details: {details}"
        logger.info(log_msg)

        if not self.logs_client:
            return

        try:
            log_stream = f"agents-{time.strftime('%Y-%m-%d')}"
            # Ensure log stream exists
            try:
                self.logs_client.create_log_stream(
                    logGroupName=settings.CLOUDWATCH_LOG_GROUP,
                    logStreamName=log_stream
                )
            except Exception:
                pass

            self.logs_client.put_log_events(
                logGroupName=settings.CLOUDWATCH_LOG_GROUP,
                logStreamName=log_stream,
                logEvents=[
                    {
                        "timestamp": int(time.time() * 1000),
                        "message": log_msg
                    }
                ]
            )
        except Exception as e:
            logger.error(f"Failed to send log event to CloudWatch Logs: {e}")

cloudwatch_service = CloudWatchService()

def get_cloudwatch_service() -> CloudWatchService:
    return cloudwatch_service
