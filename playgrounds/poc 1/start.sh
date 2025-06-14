#!/bin/bash

# AI Financial Planning System - Quick Start Script
# This script helps you quickly deploy the entire system

set -e

echo "🏦 AI Financial Planning System - POC 1"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please edit .env file and add your OpenAI API key:"
        print_warning "OPENAI_API_KEY=your_api_key_here"
        echo
        read -p "Press Enter after you've updated the .env file with your OpenAI API key..."
    else
        print_success ".env file exists"
    fi
}

# Check if OpenAI API key is set
check_openai_key() {
    if grep -q "your_openai_api_key_here" .env; then
        print_error "Please set your OpenAI API key in the .env file"
        print_error "Edit .env and replace 'your_openai_api_key_here' with your actual API key"
        exit 1
    fi
    print_success "OpenAI API key appears to be set"
}

# Start services
start_services() {
    print_status "Starting services with Docker Compose..."
    
    # Pull latest images
    docker-compose pull
    
    # Build the application
    print_status "Building application container..."
    docker-compose build ai-finance-app
    
    # Start all services
    print_status "Starting all services..."
    docker-compose up -d
    
    print_success "All services started!"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    timeout=60
    count=0
    while ! docker-compose exec -T postgres pg_isready -U admin -d financial_planning > /dev/null 2>&1; do
        sleep 2
        count=$((count + 2))
        if [ $count -ge $timeout ]; then
            print_error "PostgreSQL failed to start within $timeout seconds"
            exit 1
        fi
    done
    print_success "PostgreSQL is ready"
    
    # Wait for application
    print_status "Waiting for AI Finance App..."
    timeout=120
    count=0
    while ! curl -s http://localhost:8000 > /dev/null 2>&1; do
        sleep 3
        count=$((count + 3))
        if [ $count -ge $timeout ]; then
            print_warning "Application might still be starting. Check logs with: docker-compose logs -f ai-finance-app"
            break
        fi
    done
    
    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        print_success "AI Finance App is ready"
    fi
}

# Show access information
show_access_info() {
    echo
    echo "🎉 System is ready! Access the following interfaces:"
    echo "=================================================="
    echo
    echo "💬 Chainlit Chat Interface:  http://localhost:8000"
    echo "🗄️  pgAdmin (Database):      http://localhost:8080"
    echo "   Username: admin@example.com"
    echo "   Password: admin123"
    echo
    echo "📊 LangFuse (AI Tracing):    http://localhost:3000"
    echo "📈 Grafana (Monitoring):     http://localhost:3001"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo
    echo "🗂️  MinIO (File Storage):    http://localhost:9001"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo
    echo "💡 Examples to try:"
    echo "   - 'Покажи структуру базы данных'"
    echo "   - 'Создай план накоплений на отпуск'"
    echo "   - 'Добавь транзакцию: получил 1000 долларов'"
    echo
}

# Show logs function
show_logs() {
    print_status "Showing application logs (Ctrl+C to exit)..."
    docker-compose logs -f ai-finance-app
}

# Stop services function
stop_services() {
    print_status "Stopping all services..."
    docker-compose down
    print_success "All services stopped"
}

# Reset system function
reset_system() {
    print_warning "This will delete all data and reset the system!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Resetting system..."
        docker-compose down -v  # Remove volumes
        docker-compose up -d
        wait_for_services
        print_success "System reset complete"
    else
        print_status "Reset cancelled"
    fi
}

# Main menu
show_menu() {
    echo
    echo "What would you like to do?"
    echo "========================"
    echo "1) Start system"
    echo "2) Stop system"
    echo "3) Show logs"
    echo "4) Reset system (delete all data)"
    echo "5) Exit"
    echo
}

# Main script
main() {
    check_docker
    
    if [ "$1" = "start" ]; then
        check_env
        check_openai_key
        start_services
        wait_for_services
        show_access_info
        return
    elif [ "$1" = "stop" ]; then
        stop_services
        return
    elif [ "$1" = "logs" ]; then
        show_logs
        return
    elif [ "$1" = "reset" ]; then
        reset_system
        return
    fi
    
    # Interactive mode
    while true; do
        show_menu
        read -p "Enter your choice (1-5): " choice
        
        case $choice in
            1)
                check_env
                check_openai_key
                start_services
                wait_for_services
                show_access_info
                ;;
            2)
                stop_services
                ;;
            3)
                show_logs
                ;;
            4)
                reset_system
                ;;
            5)
                print_status "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please enter 1-5."
                ;;
        esac
    done
}

# Run main function with all arguments
main "$@"