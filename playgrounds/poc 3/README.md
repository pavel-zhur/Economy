# POC 3: AI-Powered PostgreSQL Management with Restack

Production-ready AI system for managing PostgreSQL databases through natural language using Restack workflows, React Flow UI, and comprehensive monitoring.

## 🏗️ Architecture

```
PostgreSQL + Restack + OpenAI + React Flow UI + LangFuse + Alembic
```

### Components

- **PostgreSQL 16**: Main database with pgAdmin interface
- **Restack Engine**: Event-driven workflow orchestration
- **AI Service**: Python FastAPI service with LangChain and OpenAI
- **React Flow UI**: Modern web interface with workflow visualization
- **LangFuse**: LLM tracing and analytics
- **Monitoring Stack**: Prometheus + Grafana + Jaeger
- **MinIO**: S3-compatible storage
- **Redis**: Caching and Restack task queues

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- OpenAI API key
- (Optional) LangFuse account for tracing

### 1. Environment Setup

```bash
cd "playgrounds/poc 3"
cp .env.example .env
```

Edit `.env` file:
```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional - for LLM tracing
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
```

### 2. Deploy Infrastructure

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 3. Access Services

| Service | URL | Description |
|---------|-----|-------------|
| **Main UI** | http://localhost:3000 | React Flow interface |
| **AI Service** | http://localhost:8000 | FastAPI backend |
| **Restack Dashboard** | http://localhost:5234 | Workflow monitoring |
| **pgAdmin** | http://localhost:5050 | Database management |
| **LangFuse** | http://localhost:3001 | LLM tracing |
| **Grafana** | http://localhost:3002 | Metrics dashboard |
| **Prometheus** | http://localhost:9090 | Metrics collection |
| **Jaeger** | http://localhost:16686 | Distributed tracing |

### 4. Default Credentials

- **pgAdmin**: admin@poc3.local / admin
- **Grafana**: admin / admin
- **Database**: poc3_user / poc3_password

## 💬 Using the AI Interface

### Natural Language Queries

The AI understands various types of requests:

```
"Show me all users from the last week"
"Create a table for storing customer orders"
"Add an email column to the users table"
"What's the total revenue by month?"
```

### Features

- **SQL Generation**: AI converts natural language to SQL
- **Schema Evolution**: Intelligent database migrations
- **Workflow Orchestration**: Restack handles complex operations
- **Human-in-the-Loop**: Approval gates for schema changes
- **Full Tracing**: Every operation is logged and traceable

## 🔧 Development

### AI Service Development

```bash
cd ai-service

# Install dependencies
pip install -r requirements.txt

# Run in development mode
python main.py
```

### Web UI Development

```bash
cd web-ui

# Install dependencies
npm install

# Start development server
npm start
```

### API Documentation

FastAPI provides automatic documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📊 Monitoring

### Metrics Available

- Request rates and latencies
- AI processing times
- SQL query performance
- Workflow execution status
- Database connection health
- System resource usage

### Grafana Dashboards

Pre-configured dashboards show:
- AI agent performance
- Database metrics
- Workflow execution trends
- System health overview

## 🔄 Restack Workflows

### SQL Generation Workflow

1. Receive user message
2. Analyze intent and context
3. Generate SQL with AI
4. Execute query safely
5. Return results with explanation

### Schema Migration Workflow

1. Analyze current schema
2. Generate migration script
3. Human approval gate
4. Execute migration
5. Validate results
6. Update schema version

### Workflow Features

- **Durable Execution**: Workflows survive service restarts
- **Event Sourcing**: Complete execution history
- **Retry Policies**: Automatic error recovery
- **Time Travel**: Debug by replaying workflows
- **Rate Limiting**: Protect external services

## 🛡️ Security

### Production Considerations

- [ ] SSL/TLS certificates
- [ ] Environment-specific secrets
- [ ] Database backup strategy
- [ ] Network security policies
- [ ] Authentication/authorization
- [ ] Input validation and sanitization

### Current Security

- Non-root container users
- Network isolation
- Input validation in AI service
- SQL injection protection via parameterized queries

## 📈 Scaling

### Horizontal Scaling

- Multiple AI service instances
- Restack worker pools
- Database read replicas
- CDN for static assets

### Performance Tuning

- Redis caching
- Connection pooling
- Query optimization
- Workflow parallelization

## 🧪 Testing

### Test the System

```bash
# Health check
curl http://localhost:8000/health

# AI chat test
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me all tables in the database"}'

# Schema info
curl http://localhost:8000/api/v1/schema
```

### Sample Queries

Try these natural language queries:

1. **Data Exploration**:
   - "What tables exist in the database?"
   - "Show me the structure of the users table"
   - "How many records are in each table?"

2. **Schema Creation**:
   - "Create a table for blog posts with title, content, and timestamps"
   - "Add a foreign key relationship between users and orders"

3. **Data Analysis**:
   - "Show me the most active users this month"
   - "Calculate average order value by customer segment"

## 🚨 Troubleshooting

### Common Issues

**Restack Connection Failed**:
```bash
# Check Restack engine logs
docker-compose logs restack-engine

# Restart Restack
docker-compose restart restack-engine
```

**AI Service Errors**:
```bash
# Check AI service logs
docker-compose logs ai-service

# Verify OpenAI API key
echo $OPENAI_API_KEY
```

**Database Connection Issues**:
```bash
# Check PostgreSQL status
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U poc3_user -d poc3_db -c "SELECT 1;"
```

### Log Analysis

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ai-service

# With timestamps
docker-compose logs -f -t
```

## 🎯 Next Steps

### Immediate Improvements

- [ ] Complete React Flow workflow visualization
- [ ] Add real-time WebSocket updates
- [ ] Implement user authentication
- [ ] Add more AI model options

### Advanced Features

- [ ] Multi-database support
- [ ] Custom workflow templates
- [ ] Advanced analytics dashboard
- [ ] Integration with external tools

### Production Deployment

- [ ] Kubernetes manifests
- [ ] CI/CD pipeline
- [ ] Backup/restore procedures
- [ ] Monitoring alerts

## 📚 Documentation

- [Restack Documentation](https://docs.restack.io/)
- [LangChain Documentation](https://docs.langchain.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Flow Documentation](https://reactflow.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests
4. Submit pull request

## 📄 License

This project is part of the Economy POC series and follows best practices for AI-driven database management systems.

---

**POC 3** demonstrates production-ready AI database management with enterprise-grade infrastructure, monitoring, and reliability patterns.