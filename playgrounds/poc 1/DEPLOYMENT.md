# 🚀 Deployment Guide - AI Financial Planning System POC 1

## Quick Start (5 minutes)

### 1. Prerequisites
- Docker and Docker Compose installed
- OpenAI API key

### 2. Clone and Setup
```bash
cd "playgrounds/poc 1"

# Make start script executable (if not already)
chmod +x start.sh

# Run quick start
./start.sh start
```

The script will:
- Check for dependencies
- Create `.env` file from template
- Prompt you to add OpenAI API key
- Build and start all services
- Wait for services to be ready
- Show access URLs

### 3. Access the System
After successful startup, access:
- **Main Chat Interface**: http://localhost:8000
- **Database Admin**: http://localhost:8080 (admin@example.com / admin123)
- **AI Tracing**: http://localhost:3000
- **Monitoring**: http://localhost:3001 (admin / admin123)

## Manual Setup

### 1. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit with your OpenAI API key
nano .env
```

Required environment variables:
```env
OPENAI_API_KEY=your_actual_api_key_here
```

### 2. Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f ai-finance-app
```

### 3. Stop Services
```bash
docker-compose down
```

## Service Overview

| Service | Port | Purpose | Credentials |
|---------|------|---------|-------------|
| ai-finance-app | 8000 | Main Chainlit Chat Interface | None |
| postgres | 5432 | PostgreSQL Database | admin / admin123 |
| pgadmin | 8080 | Database Web Admin | admin@example.com / admin123 |
| langfuse-server | 3000 | AI Tracing & Analytics | None |
| grafana | 3001 | Monitoring Dashboard | admin / admin123 |
| prometheus | 9090 | Metrics Collection | None |
| redis | 6379 | Caching & Queues | None |
| minio | 9000/9001 | File Storage | admin / admin123 |

## Usage Examples

### Try these prompts in the chat interface:

**Setup & Exploration:**
```
Покажи структуру базы данных
Создай базовые планы для личного бюджета
```

**Planning:**
```
Создай план накоплений на отпуск на 5000 долларов к декабрю 2024
Настрой автоматическое распределение зарплаты: 70% на текущие расходы, 20% на накопления, 10% на развлечения
```

**Transactions:**
```
Добавь транзакцию: получил зарплату 3000 долларов сегодня
Потратил 150 долларов на продукты вчера из плана "Текущие расходы"
```

**Analysis:**
```
Покажи мою текущую финансовую ситуацию
Сколько я накопил на отпуск?
Проанализируй мои расходы за последний месяц
```

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   ```bash
   # Check if API key is set
   grep OPENAI_API_KEY .env
   ```

2. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   docker-compose logs postgres
   ```

3. **Service Not Starting**
   ```bash
   # Check all service statuses
   docker-compose ps
   
   # View specific service logs
   docker-compose logs [service-name]
   ```

### Reset System
```bash
# Complete reset (deletes all data)
./start.sh reset

# Or manually
docker-compose down -v
docker-compose up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ai-finance-app
```

## Development

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Start only infrastructure
docker-compose up postgres redis minio -d

# Run application locally
cd app
python main.py
```

### Database Operations
```bash
# Connect to database
docker-compose exec postgres psql -U admin -d financial_planning

# Reset database through application
docker-compose exec ai-finance-app python -c "from database import DatabaseManager; DatabaseManager.reset_database()"
```

## Architecture

### AI Agents Flow
```
User Message → LangGraph Orchestrator → Specialized Agents → Database → Response
```

### Agent Types
- **SQL Agent**: Basic database operations
- **Planning Agent**: Financial planning with enhanced context
- **Analysis Agent**: Data analysis and reporting
- **Schema Agent**: Database structure modifications

### Data Model
- **Planning Layer**: plans, goals, distribution_rules
- **Actual Data Layer**: transactions, wallets, inventories
- **System Layer**: logs, balances, assets, debts

## Security Notes

- Default passwords are for development only
- Change all credentials for production use
- OpenAI API key is sensitive - keep secure
- Consider adding HTTPS for production

## Support

For issues:
1. Check logs: `docker-compose logs ai-finance-app`
2. Verify all services are running: `docker-compose ps`
3. Check LangFuse for AI tracing: http://localhost:3000
4. Monitor system health: http://localhost:3001