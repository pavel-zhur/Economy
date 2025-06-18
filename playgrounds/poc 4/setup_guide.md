# POC 4 Setup Guide

## Prerequisites

- Docker and Docker Compose installed
- OpenAI API key or Anthropic API key
- Git (for cloning)

## Quick Start

### 1. Environment Setup

1. Copy the environment example file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` file and add your API keys:
   ```bash
   # Required: Add at least one API key
   OPENAI_API_KEY=sk-your-openai-key-here
   # OR
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
   ```

### 2. Launch with Docker

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

### 3. Access the Applications

- **Chainlit Chat Interface**: http://localhost:8000
- **LangFuse Tracing**: http://localhost:3000
- **PostgreSQL**: localhost:5432

## Manual Setup (Development)

If you prefer to run without Docker:

### 1. Database Setup

Start PostgreSQL (using Docker):
```bash
docker run -d \
  --name poc4-postgres \
  -e POSTGRES_DB=poc4_db \
  -e POSTGRES_USER=poc4_user \
  -e POSTGRES_PASSWORD=poc4_password \
  -p 5432:5432 \
  postgres:15-alpine
```

### 2. Python Environment

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
chainlit run app.py --host 0.0.0.0 --port 8000
```

### 3. LangFuse Setup (Optional)

For tracing and monitoring:

```bash
# Start LangFuse
docker run -d \
  --name langfuse \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://langfuse:password@host.docker.internal:5432/langfuse \
  langfuse/langfuse:latest
```

Then update your `.env` with LangFuse credentials from the UI.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://poc4_user:poc4_password@localhost:5432/poc4_db` |
| `OPENAI_API_KEY` | OpenAI API key for GPT models | - |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude models | - |
| `LANGFUSE_PUBLIC_KEY` | LangFuse public key for tracing | - |
| `LANGFUSE_SECRET_KEY` | LangFuse secret key for tracing | - |
| `LANGFUSE_HOST` | LangFuse host URL | `http://localhost:3000` |
| `LLM_MODEL` | LLM model to use | `gpt-4o-mini` |
| `LLM_TEMPERATURE` | LLM temperature | `0.1` |
| `MAX_ITERATIONS` | Max agent iterations | `10` |
| `DEBUG` | Enable debug mode | `false` |
| `LOG_LEVEL` | Logging level | `INFO` |

### Chainlit Configuration

The application uses `chainlit.md` for the welcome page and supports:
- Text conversations
- File uploads (images, documents)
- Audio input (placeholder implementation)
- Real-time step visualization

## Usage Examples

Once the application is running, try these commands:

### Basic Database Operations
```
Show me all tables in the database
Create a users table with id, name, email, and timestamp
Add 5 sample users to the users table
```

### Data Analysis
```
What's the structure of the conversations table?
Show me all conversations from today
Count how many records are in each table
```

### Schema Management
```
Add an index on the email column in users table
Create a posts table that references users
Show me the relationship between tables
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check if PostgreSQL is running
   - Verify DATABASE_URL in `.env`
   - Ensure database credentials are correct

2. **LLM API Errors**
   - Verify API keys are correctly set
   - Check API key validity and quotas
   - Try switching between OpenAI and Anthropic

3. **LangFuse Not Working**
   - LangFuse keys are optional for basic functionality
   - Check LangFuse container is running
   - Verify LangFuse credentials in UI

4. **Docker Issues**
   - Try `docker-compose down && docker-compose up -d`
   - Check Docker logs: `docker-compose logs`
   - Ensure ports 3000, 5432, 8000 are available

### Logs and Debugging

```bash
# Application logs
docker-compose logs -f backend

# Database logs
docker-compose logs -f postgres

# LangFuse logs
docker-compose logs -f langfuse
```

## Next Steps

This POC demonstrates:
- ✅ Natural language database interaction
- ✅ AI-powered schema creation and modification
- ✅ Real-time tracing with LangFuse
- ✅ Web-based chat interface
- ✅ Docker-based deployment

For production use, consider:
- Authentication and authorization
- Rate limiting
- Enhanced error handling
- Database backup strategies
- Scaling considerations
- Security hardening 