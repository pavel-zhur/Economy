# Economy A5 - POC

AI-powered personal budget tracker with schema evolution capabilities.

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -e .
   ```

2. **Set OpenAI API key:**
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

3. **Check system status:**
   ```bash
   economy-poc status
   ```

4. **Process messages in feed mode:**
   ```bash
   economy-poc feed-mode
   ```

5. **Start schema migration session:**
   ```bash
   economy-poc migration-session
   ```

## Project Structure

```
src/economy_a5/
├── models/          # Data models and types
├── core/            # Business logic interfaces  
├── services/        # Service implementations
├── config/          # Configuration management
└── console/         # Console application

data/               # POC data files
├── messages.txt                    # Input messages
├── current_schema.json            # Current JSON schema
├── cookbook.md                    # Interpretation guide
├── current_interpretations.json   # Structured data
├── architect_instructions.md      # Schema architect prompts
├── interpreter_instructions.md    # Interpreter prompts
└── migration_session.md          # Session logs
```

## Commands

### `economy-poc status`
Shows current system status including file counts and availability.

### `economy-poc feed-mode`
Processes new messages from `messages.txt` using the current schema and saves interpretations.

### `economy-poc migration-session` 
Starts an interactive session with the Schema Architect to evolve your schema. Includes preview functionality to test changes before committing.

## Docker

```bash
# Build image
docker build -t economy-a5 .

# Run with mounted data directory
docker run -v $(pwd)/data:/app/data -e OPENAI_API_KEY="your-key" economy-a5 economy-poc status
```

## Development

```bash
# Install with dev dependencies
pip install -e ".[dev]"

# Type checking
mypy src/

# Code formatting
black src/
ruff src/
```