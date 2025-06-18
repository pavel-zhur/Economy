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

# Check if OpenAI API key is set (optional now)
if ! grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
    echo "⚠️  OpenAI API key not found in .env file!"
    echo "   The system will start but AI features will be limited."
    echo "   To enable full AI functionality, set OPENAI_API_KEY=your_api_key_here"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🔧 Starting infrastructure..."

# Stop any existing containers
docker-compose down -v 2>/dev/null || true

# Build and start services
echo "   Building and starting services..."
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
        echo "   Check logs: docker-compose logs postgres"
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
        echo "   This might be due to missing OpenAI API key or other issues."
        echo "   Check logs: docker-compose logs ai-service"
        
        # Try to continue anyway
        echo "   Attempting to continue without AI service health check..."
        break
    fi
done

if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "   ✅ AI Service ready"
else
    echo "   ⚠️  AI Service may have issues, but continuing..."
fi

# Wait for Web UI
echo "   Waiting for Web UI..."
timeout=90
counter=0
until curl -s http://localhost:3000 > /dev/null 2>&1; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -gt $timeout ]; then
        echo "❌ Web UI failed to start within $timeout seconds"
        echo "   Check logs: docker-compose logs web-ui"
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
echo "🔄 Mock Restack:       http://localhost:5233 (PostgreSQL fallback)"
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
echo "   'Hello, what can you help me with?'"
echo "   'Show me all tables in the database'"
echo "   'What's the current database schema?'"
echo ""
echo "📖 Full documentation: README.md"
echo ""

# Test the system
echo "🧪 Running quick system test..."
response=$(curl -s -X POST http://localhost:8000/api/v1/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello, what can you help me with?"}' 2>/dev/null || echo '{"success":false}')

if echo "$response" | grep -q "success.*true"; then
    echo "   ✅ System test passed"
elif echo "$response" | grep -q "OpenAI API key"; then
    echo "   ⚠️  System running with limited AI features (no OpenAI API key)"
else
    echo "   ⚠️  System test warning - check logs if needed"
    echo "   Response: $response"
fi

echo ""
echo "🚀 Ready to use! Open http://localhost:3000 to get started."

# Show logs option
echo ""
read -p "Show live logs? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Showing live logs (Ctrl+C to exit)..."
    docker-compose logs -f
fi