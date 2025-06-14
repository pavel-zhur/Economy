#!/bin/bash

# POC 3 Startup Script
# Production-ready AI-powered PostgreSQL management with Restack

set -e

echo "🚀 Starting POC 3: AI-Powered PostgreSQL Management"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your API keys before proceeding!"
    echo "   Required: OPENAI_API_KEY"
    echo "   Optional: LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY"
    echo ""
    read -p "Press Enter after editing .env file..."
fi

# Check if OpenAI API key is set
if ! grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
    echo "❌ OpenAI API key not found in .env file!"
    echo "   Please set OPENAI_API_KEY=your_api_key_here"
    exit 1
fi

echo "🔧 Starting infrastructure..."

# Stop any existing containers
docker-compose down -v 2>/dev/null || true

# Build and start services
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."

# Wait for PostgreSQL
echo "   Waiting for PostgreSQL..."
timeout=60
counter=0
until docker-compose exec -T postgres pg_isready -U poc3_user > /dev/null 2>&1; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -gt $timeout ]; then
        echo "❌ PostgreSQL failed to start within $timeout seconds"
        exit 1
    fi
done
echo "   ✅ PostgreSQL ready"

# Wait for AI Service
echo "   Waiting for AI Service..."
timeout=120
counter=0
until curl -s http://localhost:8000/health > /dev/null 2>&1; do
    sleep 3
    counter=$((counter + 3))
    if [ $counter -gt $timeout ]; then
        echo "❌ AI Service failed to start within $timeout seconds"
        docker-compose logs ai-service
        exit 1
    fi
done
echo "   ✅ AI Service ready"

# Wait for Web UI
echo "   Waiting for Web UI..."
timeout=60
counter=0
until curl -s http://localhost:3000 > /dev/null 2>&1; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -gt $timeout ]; then
        echo "❌ Web UI failed to start within $timeout seconds"
        docker-compose logs web-ui
        exit 1
    fi
done
echo "   ✅ Web UI ready"

echo ""
echo "🎉 POC 3 is ready!"
echo "=================="
echo ""
echo "📱 Main Interface:     http://localhost:3000"
echo "🤖 AI Service API:     http://localhost:8000"
echo "📊 API Docs:           http://localhost:8000/docs"
echo "🔄 Restack Dashboard:  http://localhost:5234"
echo "🗄️  pgAdmin:           http://localhost:5050"
echo "📈 Grafana:            http://localhost:3002"
echo "🔍 Prometheus:         http://localhost:9090"
echo "🕵️  Jaeger:            http://localhost:16686"
echo "📋 LangFuse:           http://localhost:3001"
echo ""
echo "🔑 Default Credentials:"
echo "   pgAdmin: admin@poc3.local / admin"
echo "   Grafana: admin / admin"
echo "   Database: poc3_user / poc3_password"
echo ""
echo "💬 Try these natural language queries:"
echo "   'Show me all tables in the database'"
echo "   'Create a table for user profiles'"
echo "   'What's the current database schema?'"
echo ""
echo "📖 Full documentation: README.md"
echo ""

# Test the system
echo "🧪 Running quick system test..."
response=$(curl -s -X POST http://localhost:8000/api/v1/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello, what can you help me with?"}')

if echo "$response" | grep -q "success.*true"; then
    echo "   ✅ System test passed"
else
    echo "   ⚠️  System test warning - check logs if needed"
fi

echo ""
echo "🚀 Ready to use! Open http://localhost:3000 to get started."

# Show logs option
read -p "Show live logs? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Showing live logs (Ctrl+C to exit)..."
    docker-compose logs -f
fi