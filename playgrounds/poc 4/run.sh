#!/bin/bash

# POC 4 AI-managed Database Runner Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 POC 4: AI-Managed Database Setup${NC}"
echo "=================================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from template..."
    
    if [ -f env.example ]; then
        cp env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo -e "${YELLOW}📝 Please edit .env and add your API keys before continuing${NC}"
        
        # Open .env in default editor if available
        if command -v code &> /dev/null; then
            echo "Opening .env in VS Code..."
            code .env
        elif command -v nano &> /dev/null; then
            echo "Opening .env in nano..."
            nano .env
        else
            echo "Please edit .env manually and add your API keys"
        fi
        
        echo "Press Enter when you've added your API keys..."
        read -r
    else
        echo -e "${RED}❌ env.example not found${NC}"
        exit 1
    fi
fi

# Check for API keys
if ! grep -q "OPENAI_API_KEY=sk-" .env && ! grep -q "ANTHROPIC_API_KEY=sk-ant-" .env; then
    echo -e "${RED}❌ No API keys found in .env${NC}"
    echo "Please add at least one API key:"
    echo "  - OPENAI_API_KEY=sk-your-key-here"
    echo "  - ANTHROPIC_API_KEY=sk-ant-your-key-here"
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration looks good${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found${NC}"
    echo "Please install Docker and Docker Compose"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found${NC}"
    echo "Please install Docker Compose"
    exit 1
fi

echo -e "${GREEN}✅ Docker is available${NC}"

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose down --remove-orphans 2>/dev/null || true

# Build and start containers
echo -e "${BLUE}🔨 Building and starting containers...${NC}"
docker-compose up -d --build

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
while ! docker-compose exec -T postgres pg_isready -U poc4_user -d poc4_db >/dev/null 2>&1; do
    sleep 1
done
echo -e "${GREEN}✅ PostgreSQL is ready${NC}"

# Wait for backend
echo "Waiting for backend..."
sleep 10  # Give backend time to start

# Wait for LangFuse (optional)
echo "Waiting for LangFuse..."
sleep 5

echo ""
echo -e "${GREEN}🎉 All services are running!${NC}"
echo ""
echo "Access your services:"
echo -e "${BLUE}📱 Chainlit Chat Interface:${NC} http://localhost:8000"
echo -e "${BLUE}📊 LangFuse Tracing:${NC}        http://localhost:3000"
echo -e "${BLUE}🗄️  PostgreSQL Database:${NC}    localhost:5432"
echo ""
echo "Useful commands:"
echo -e "${YELLOW}📋 View logs:${NC}           docker-compose logs -f backend"
echo -e "${YELLOW}🛑 Stop services:${NC}       docker-compose down"
echo -e "${YELLOW}🔄 Restart backend:${NC}     docker-compose restart backend"
echo ""

# Show logs
echo -e "${BLUE}📋 Showing backend logs (Ctrl+C to exit):${NC}"
docker-compose logs -f backend 