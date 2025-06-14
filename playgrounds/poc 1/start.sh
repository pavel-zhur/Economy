#!/bin/bash

# Economy POC Stack 1 - Startup Script
# This script helps you start the AI Financial Assistant system

set -e  # Exit on any error

echo "🏦 Economy POC Stack 1 - LangGraph Classic"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "🔑 Please edit .env file and add your OpenAI API key:"
    echo "   OPENAI_API_KEY=your_key_here"
    echo ""
    read -p "Press Enter after you've added your OpenAI API key to .env file..."
fi

# Check if OpenAI API key is set
if ! grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
    echo "⚠️  OpenAI API key not found in .env file!"
    echo "🔑 Please add your OpenAI API key to the .env file:"
    echo "   OPENAI_API_KEY=your_key_here"
    echo ""
    exit 1
fi

echo "🚀 Starting Economy POC services..."
echo ""

# Start services with docker-compose
docker-compose up -d

echo ""
echo "⏳ Waiting for services to initialize..."

# Wait for database to be ready
echo "   📊 Waiting for PostgreSQL..."
timeout 60 bash -c 'until docker-compose exec -T postgres pg_isready -U postgres; do sleep 2; done' || {
    echo "❌ PostgreSQL failed to start within 60 seconds"
    exit 1
}

# Wait for application to be ready
echo "   🤖 Waiting for application..."
timeout 120 bash -c 'until curl -f http://localhost:8000/health >/dev/null 2>&1; do sleep 3; done' || {
    echo "❌ Application failed to start within 120 seconds"
    echo "📋 Check logs with: docker-compose logs app"
    exit 1
}

echo ""
echo "🎉 Economy POC is ready!"
echo ""
echo "🌐 Access your services:"
echo "   💬 Chainlit Chat UI:     http://localhost:8001"
echo "   🔧 FastAPI Backend:      http://localhost:8000"
echo "   📊 LangFuse Tracing:     http://localhost:3000"
echo "   🗄️  pgAdmin:              http://localhost:5050"
echo "   📈 Grafana:              http://localhost:3001"
echo ""
echo "🔐 Default credentials (development only):"
echo "   pgAdmin:    admin@example.com / admin"
echo "   Grafana:    admin / admin"
echo ""
echo "💡 Try these example queries in the chat:"
echo '   "I want to track my monthly expenses"'
echo '   "Create a budget for my vacation fund"'
echo '   "I need to save $5000 for a car by next year"'
echo ""
echo "📖 For more information, see README.md"
echo ""

# Open browser if possible
if command -v xdg-open > /dev/null; then
    echo "🌐 Opening chat interface in browser..."
    xdg-open http://localhost:8001
elif command -v open > /dev/null; then
    echo "🌐 Opening chat interface in browser..."
    open http://localhost:8001
fi

echo "✅ Setup complete! Enjoy using your AI Financial Assistant!"