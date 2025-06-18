# POC 4 AI-managed Database Runner Script for Windows PowerShell

Write-Host "🤖 POC 4: AI-Managed Database Setup" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
    Write-Host "Creating .env from template..."
    
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ Created .env file" -ForegroundColor Green
        Write-Host "📝 Please edit .env and add your API keys before continuing" -ForegroundColor Yellow
        
        # Try to open .env in VS Code or notepad
        if (Get-Command "code" -ErrorAction SilentlyContinue) {
            Write-Host "Opening .env in VS Code..."
            code .env
        } else {
            Write-Host "Opening .env in Notepad..."
            notepad .env
        }
        
        Write-Host "Press Enter when you've added your API keys..." -ForegroundColor Yellow
        Read-Host
    } else {
        Write-Host "❌ env.example not found" -ForegroundColor Red
        exit 1
    }
}

# Check for API keys
$envContent = Get-Content ".env" -Raw
if (-not ($envContent -match "OPENAI_API_KEY=sk-" -or $envContent -match "ANTHROPIC_API_KEY=sk-ant-")) {
    Write-Host "❌ No API keys found in .env" -ForegroundColor Red
    Write-Host "Please add at least one API key:"
    Write-Host "  - OPENAI_API_KEY=sk-your-key-here"
    Write-Host "  - ANTHROPIC_API_KEY=sk-ant-your-key-here"
    exit 1
}

Write-Host "✅ Environment configuration looks good" -ForegroundColor Green

# Check Docker
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker not found" -ForegroundColor Red
    Write-Host "Please install Docker Desktop for Windows"
    exit 1
}

if (-not (Get-Command "docker-compose" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose not found" -ForegroundColor Red
    Write-Host "Please install Docker Compose"
    exit 1
}

Write-Host "✅ Docker is available" -ForegroundColor Green

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Blue
docker-compose down --remove-orphans 2>$null

# Build and start containers
Write-Host "🔨 Building and starting containers..." -ForegroundColor Blue
docker-compose up -d --build

# Wait for services to be ready
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Blue

# Wait for PostgreSQL
Write-Host "Waiting for PostgreSQL..."
do {
    Start-Sleep 1
    $pgReady = docker-compose exec -T postgres pg_isready -U poc4_user -d poc4_db 2>$null
} while ($LASTEXITCODE -ne 0)

Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green

# Wait for backend
Write-Host "Waiting for backend..."
Start-Sleep 10

# Wait for LangFuse
Write-Host "Waiting for LangFuse..."
Start-Sleep 5

Write-Host ""
Write-Host "🎉 All services are running!" -ForegroundColor Green
Write-Host ""
Write-Host "Access your services:"
Write-Host "📱 Chainlit Chat Interface: http://localhost:8000" -ForegroundColor Blue
Write-Host "📊 LangFuse Tracing:        http://localhost:3000" -ForegroundColor Blue
Write-Host "🗄️  PostgreSQL Database:    localhost:5432" -ForegroundColor Blue
Write-Host ""
Write-Host "Useful commands:"
Write-Host "📋 View logs:           docker-compose logs -f backend" -ForegroundColor Yellow
Write-Host "🛑 Stop services:       docker-compose down" -ForegroundColor Yellow
Write-Host "🔄 Restart backend:     docker-compose restart backend" -ForegroundColor Yellow
Write-Host ""

# Show logs
Write-Host "📋 Showing backend logs (Ctrl+C to exit):" -ForegroundColor Blue
docker-compose logs -f backend 