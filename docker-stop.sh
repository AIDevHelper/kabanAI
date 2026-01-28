#!/bin/bash

# KabanAI Docker Stop Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping KabanAI...${NC}"
echo ""

# Stop containers
docker-compose down

echo ""
echo -e "${GREEN}✓ KabanAI stopped${NC}"
echo ""
echo "To start again, run: ./docker-start.sh"
