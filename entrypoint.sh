#!/bin/bash
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting 10S Analytics Dashboard...${NC}"

# Check if running in AWS (has AWS credentials)
if [ -z "$AWS_REGION" ]; then
    echo -e "${YELLOW}AWS_REGION not set, using ap-southeast-2${NC}"
    AWS_REGION="ap-southeast-2"
fi

# Try to fetch secrets from Parameter Store
if command -v aws &> /dev/null; then
    echo -e "${GREEN}AWS CLI found, attempting to fetch secrets from Parameter Store...${NC}"

    # Try to fetch each secret, but don't fail if Parameter Store is unreachable
    if aws ssm get-parameter --name /10s/analytics/DATABASE_URL --with-decryption --region "$AWS_REGION" &> /dev/null; then
        echo -e "${GREEN}Fetching secrets from Parameter Store...${NC}"

        DATABASE_URL=$(aws ssm get-parameter --name /10s/analytics/DATABASE_URL --with-decryption --region "$AWS_REGION" --query 'Parameter.Value' --output text)
        ADMIN_EMAIL=$(aws ssm get-parameter --name /10s/analytics/ADMIN_EMAIL --with-decryption --region "$AWS_REGION" --query 'Parameter.Value' --output text)
        ADMIN_PASSWORD_HASH=$(aws ssm get-parameter --name /10s/analytics/ADMIN_PASSWORD_HASH --with-decryption --region "$AWS_REGION" --query 'Parameter.Value' --output text)
        JWT_SECRET=$(aws ssm get-parameter --name /10s/analytics/JWT_SECRET --with-decryption --region "$AWS_REGION" --query 'Parameter.Value' --output text)

        export DATABASE_URL
        export ADMIN_EMAIL
        export ADMIN_PASSWORD_HASH
        export JWT_SECRET

        echo -e "${GREEN}Secrets loaded from Parameter Store${NC}"
    else
        echo -e "${YELLOW}Parameter Store not accessible, using local .env file${NC}"
    fi
else
    echo -e "${YELLOW}AWS CLI not found, using local .env file${NC}"
fi

# Load .env file if it exists
if [ -f .env.analytics ]; then
    echo -e "${GREEN}Loading .env.analytics...${NC}"
    set -a
    # shellcheck disable=SC1091
    source .env.analytics
    set +a
fi

# Validate required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL not set${NC}"
    exit 1
fi

if [ -z "$ADMIN_PASSWORD_HASH" ]; then
    echo -e "${RED}ERROR: ADMIN_PASSWORD_HASH not set${NC}"
    exit 1
fi

echo -e "${GREEN}Starting uvicorn server...${NC}"

# Start uvicorn
exec uvicorn src.main:app \
    --host 0.0.0.0 \
    --port 8002 \
    --workers 2
