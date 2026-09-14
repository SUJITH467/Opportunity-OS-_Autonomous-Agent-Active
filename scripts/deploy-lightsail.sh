#!/usr/bin/env bash
# ==============================================================================
# OpportunityOS - AWS Lightsail Docker Host Deployment Script
# Idempotent deployment runner for Frontend + FastAPI Backend
# ==============================================================================
set -euo pipefail

echo "=================================================================="
echo " Starting OpportunityOS Lightsail Idempotent Deployment"
echo " Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=================================================================="

# 1. Determine working directory (root of repository)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${APP_DIR}"
echo "[1/6] Working directory: ${APP_DIR}"

# 2. Check and install Docker & Docker Compose if missing (Idempotent)
if ! command -v docker &> /dev/null; then
    echo "[2/6] Docker not found. Installing Docker Engine..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update -y
        sudo apt-get install -y ca-certificates curl gnupg lsb-release
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update -y
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        sudo systemctl enable docker
        sudo systemctl start docker
        sudo usermod -aG docker "$USER" || true
    elif command -v yum &> /dev/null; then
        sudo yum update -y
        sudo yum install -y docker
        sudo systemctl enable docker
        sudo systemctl start docker
        sudo usermod -aG docker "$USER" || true
    fi
else
    echo "[2/6] Docker is already installed: $(docker --version)"
fi

# Detect docker compose command (plugin or standalone)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "ERROR: Docker Compose is not installed!"
    exit 1
fi
echo "[2/6] Using Compose: ${COMPOSE_CMD}"

# 3. Idempotent Environment Configuration Check
echo "[3/6] Verifying environment configuration..."
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# ENFORCE: REQUIRE_HUMAN_APPROVAL must always be true
if grep -q "^REQUIRE_HUMAN_APPROVAL=" .env; then
    sed -i 's/^REQUIRE_HUMAN_APPROVAL=.*/REQUIRE_HUMAN_APPROVAL=true/' .env
else
    echo "REQUIRE_HUMAN_APPROVAL=true" >> .env
fi
echo "Enforced security guardrail: REQUIRE_HUMAN_APPROVAL=true"

# 4. Build and deploy containers idempotently
echo "[4/6] Building and starting containers..."
${COMPOSE_CMD} down --remove-orphans || true
${COMPOSE_CMD} build
${COMPOSE_CMD} up -d --remove-orphans

# 5. Idempotent Health Checks
echo "[5/6] Running container health checks..."
MAX_RETRIES=20
RETRY_INTERVAL=3
HEALTHY=false

for i in $(seq 1 $MAX_RETRIES); do
    echo "Health check attempt $i/$MAX_RETRIES..."
    
    # Check backend /health
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health || echo "000")
    # Check frontend /api/health
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")
    
    echo "  -> Backend HTTP status:  ${BACKEND_STATUS} (expected: 200)"
    echo "  -> Frontend HTTP status: ${FRONTEND_STATUS} (expected: 200)"
    
    if [ "${BACKEND_STATUS}" = "200" ] && [ "${FRONTEND_STATUS}" = "200" ]; then
        HEALTHY=true
        break
    fi
    
    sleep $RETRY_INTERVAL
done

if [ "$HEALTHY" = true ]; then
    echo "=================================================================="
    echo " SUCCESS: OpportunityOS services are healthy and running!"
    echo " Backend:  http://localhost:8000/health (200 OK)"
    echo " Frontend: http://localhost:3000/api/health (200 OK)"
    echo "=================================================================="
else
    echo "=================================================================="
    echo " ERROR: Health checks failed after $MAX_RETRIES attempts."
    echo " Dumping container logs for diagnosis:"
    echo "=================================================================="
    ${COMPOSE_CMD} logs --tail 50
    exit 1
fi

# 6. Cleanup dangling images (idempotent resource maintenance)
echo "[6/6] Cleaning up dangling Docker images..."
docker image prune -f || true

echo "Deployment complete."
