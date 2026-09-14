#!/usr/bin/env bash
# ==============================================================================
# OpportunityOS - Idempotent DynamoDB Table Deployment Script
# ==============================================================================
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=================================================================="
echo " Deploying OpportunityOS DynamoDB Tables (Idempotent)"
echo " Region: ${AWS_REGION}"
echo "=================================================================="

TABLES=(
    "OpportunityOS_Students:student_id"
    "OpportunityOS_Opportunities:opportunity_id"
    "OpportunityOS_Applications:application_id"
    "OpportunityOS_Documents:document_id"
    "OpportunityOS_AgentActivity:activity_id"
)

for entry in "${TABLES[@]}"; do
    TABLE_NAME="${entry%%:*}"
    KEY_NAME="${entry##*:}"
    
    echo "Checking table '${TABLE_NAME}'..."
    EXISTS=$(aws dynamodb describe-table --table-name "${TABLE_NAME}" --region "${AWS_REGION}" --query "Table.TableStatus" --output text 2>/dev/null || echo "NOT_FOUND")
    
    if [ "${EXISTS}" = "NOT_FOUND" ]; then
        echo "Creating table '${TABLE_NAME}' (HASH Key: ${KEY_NAME})..."
        aws dynamodb create-table \
            --table-name "${TABLE_NAME}" \
            --attribute-definitions "AttributeName=${KEY_NAME},AttributeType=S" \
            --key-schema "AttributeName=${KEY_NAME},KeyType=HASH" \
            --billing-mode "PAY_PER_REQUEST" \
            --region "${AWS_REGION}" > /dev/null
        echo "Table '${TABLE_NAME}' creation initiated."
    else
        echo "Table '${TABLE_NAME}' already exists (Status: ${EXISTS}). Skipping."
    fi
done

echo "DynamoDB tables verification complete."
