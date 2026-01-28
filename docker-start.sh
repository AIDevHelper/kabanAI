#!/bin/bash

# KabanAI Docker Start Script
# Usage: ./docker-start.sh [dev|prod]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║               🤖 KabanAI Docker Launcher                ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker found${NC}"
echo -e "${GREEN}✓ Docker Compose found${NC}"
echo ""

# Determine environment
ENV=${1:-prod}

if [ "$ENV" = "dev" ]; then
    echo -e "${YELLOW}🔧 Starting in DEVELOPMENT mode...${NC}"
    COMPOSE_FILE="docker-compose.yml -f docker-compose.dev.yml"
elif [ "$ENV" = "prod" ]; then
    echo -e "${GREEN}🚀 Starting in PRODUCTION mode...${NC}"
    COMPOSE_FILE="docker-compose.yml -f docker-compose.prod.yml"
else
    echo -e "${YELLOW}📦 Starting with default configuration...${NC}"
    COMPOSE_FILE="docker-compose.yml"
fi

echo ""
echo "Building and starting containers..."
echo ""

# Build and start
docker-compose -f $COMPOSE_FILE up -d --build

# Wait for container to be ready
echo ""
echo "Waiting for KabanAI to be ready..."
sleep 5

# Check if container is running
if docker ps | grep -q kabanai; then
    echo -e "${GREEN}✓ Container is running${NC}"
    
    # Show logs
    echo ""
    echo -e "${BLUE}Last 20 log lines:${NC}"
    docker-compose logs --tail=20 kabanai
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                          ║${NC}"
    echo -e "${GREEN}║  🎉 KabanAI is running!                                 ║${NC}"
    echo -e "${GREEN}║                                                          ║${NC}"
    echo -e "${GREEN}║  📍 Access at: ${BLUE}http://localhost:5001${GREEN}                  ║${NC}"
    echo -e "${GREEN}║  🔐 Login: ${BLUE}thomas / cb1312ef${GREEN}                         ║${NC}"
    echo -e "${GREEN}║                                                          ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  View logs:    docker-compose logs -f"
    echo "  Stop:         docker-compose down"
    echo "  Restart:      docker-compose restart"
    echo "  Shell access: docker-compose exec kabanai bash"
    echo ""
    
    # Open browser (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${BLUE}Opening browser...${NC}"
        open http://localhost:5001
    fi
    
else
    echo -e "${RED}❌ Container failed to start!${NC}"
    echo ""
    echo "Check logs with: docker-compose logs kabanai"
    exit 1
fi
