# Economy POC Stack 1: LangGraph Classic

AI-managed PostgreSQL database system for personal finance management using LangGraph, LangChain, and Chainlit.

## 🏗️ Architecture

This POC demonstrates an AI-first approach to financial data management where:
- **AI understands** natural language financial requests
- **AI creates** database schemas dynamically as needed
- **AI manages** data storage, queries, and migrations
- **AI provides** insights and analysis

### Core Components

- **PostgreSQL 16**: Main database with JSONB support
- **LangGraph**: Multi-agent workflow orchestration
- **LangChain SQL Agent**: Natural language to SQL translation
- **Chainlit**: Chat interface for user interaction
- **LangFuse**: LLM tracing and observability
- **FastAPI**: REST API backend
- **Prometheus + Grafana**: Monitoring and metrics

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- OpenAI API key

### Setup

1. **Clone and navigate to the project:**
   ```bash
   cd "playgrounds/poc 1"
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Start the infrastructure:**
   ```bash
   docker-compose up -d
   ```

4. **Wait for services to be ready** (about 2-3 minutes)

5. **Access the interfaces:**
   - **Chainlit Chat UI**: http://localhost:8001
   - **FastAPI Backend**: http://localhost:8000
   - **LangFuse Tracing**: http://localhost:3000
   - **pgAdmin**: http://localhost:5050
   - **Grafana**: http://localhost:3001

## 💬 Using the Chat Interface

Open http://localhost:8001 and try these example requests:

### Getting Started
```
"I want to track my monthly expenses"
"Create a budget for my vacation fund"
"I need to save $5000 for a car by next year"
```

### Data Management
```
"Record a $50 grocery expense from yesterday"
"Show me all my transactions from last month"
"I earned $3000 salary this month"
```

### Analysis
```
"What's my spending pattern for food?"
"How much am I saving towards my goals?"
"Show me my budget vs actual expenses"
```

## 🛠️ Development

### Manual Setup (Alternative to Docker)

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up PostgreSQL database:**
   ```bash
   # Install PostgreSQL 16
   createdb economy_poc
   ```

3. **Configure environment:**
   ```bash
   export DATABASE_URL="postgresql://postgres:password@localhost:5432/economy_poc"
   export OPENAI_API_KEY="your-api-key"
   ```

4. **Run the application:**
   ```bash
   # Backend API
   python -m src.main

   # Chat interface (in another terminal)
   chainlit run src/chainlit_app.py
   ```

### API Endpoints

- `GET /` - System information
- `GET /health` - Health check
- `POST /api/query` - Process natural language query
- `GET /api/schema` - Current database schema
- `GET /api/schema/history` - Schema change history
- `GET /api/metrics` - System metrics
- `POST /api/validate` - Validate SQL query

## 🔍 Key Features

### 1. Dynamic Schema Evolution
The AI automatically creates and modifies database tables based on your requests:

```
User: "I want to track my gym membership expenses"
AI: Creates tables for expenses, categories, and gym-specific fields
```

### 2. Natural Language Interface
No SQL knowledge required - just describe what you want:

```
User: "Show me how much I spent on food last month"
AI: Generates and executes appropriate SQL queries
```

### 3. Financial Domain Intelligence
Built-in understanding of financial concepts:
- Transactions, accounts, budgets
- Goals, plans, categories
- Income, expenses, savings

### 4. Complete Observability
- All AI decisions are logged and traceable
- Schema changes are recorded with reasoning
- Performance metrics are collected
- LLM usage is monitored

## 📊 Monitoring

### LangFuse (Tracing)
- Visit http://localhost:3000
- Default credentials: admin / admin (in development)
- Trace all LLM interactions and costs

### Grafana (Metrics)
- Visit http://localhost:3001
- Default credentials: admin / admin
- Monitor system performance and usage

### pgAdmin (Database)
- Visit http://localhost:5050  
- Default credentials: admin@example.com / admin
- Inspect database schema and data

## 🏦 Financial Concepts

The system understands and works with these financial concepts:

### Plans
- Virtual containers for organizing money by purpose
- Can be nested hierarchically
- Track both planned and actual amounts

### Transactions
- Actual money movements (income/expenses)
- Can be linked to plans for tracking
- Support categories and metadata

### Goals
- Savings targets with deadlines
- Progress tracking and projections
- Integration with budget planning

### Budgets
- Spending limits by category or timeframe
- Comparison with actual expenses
- Alert capabilities for overspending

## 🔒 Security Notes

This is a POC for development and testing:
- Uses default passwords for services
- No authentication on API endpoints
- All data is stored locally
- Not suitable for production use

For production deployment:
- Change all default passwords
- Enable authentication and authorization
- Use proper SSL/TLS certificates
- Implement proper backup procedures

## 🐛 Troubleshooting

### Common Issues

1. **Services not starting:**
   ```bash
   docker-compose logs [service-name]
   ```

2. **Database connection errors:**
   - Wait for PostgreSQL to fully initialize
   - Check logs: `docker-compose logs postgres`

3. **AI responses are slow:**
   - Check OpenAI API key configuration
   - Monitor LangFuse for token usage

4. **Schema changes failing:**
   - Check database logs for SQL errors
   - Review schema change history at `/api/schema/history`

### Logs

View application logs:
```bash
docker-compose logs -f app
```

## 🔮 Future Enhancements

This POC can be extended with:
- Multi-user support
- Bank account integration
- Investment tracking
- Advanced analytics and reports
- Mobile app interface
- Voice interaction support

## 📄 License

This is a POC project for demonstration purposes.