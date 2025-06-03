# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current Status: POC Phase

This repository contains a **Proof of Concept (POC)** for a personal budget tracker with AI-powered schema evolution. The POC validates core concepts before building the full system.

## Architecture Overview

### POC Components
- **Console Application**: CLI tool for testing core functionality
- **Interpreter Service**: AI that converts natural language to structured data (gpt-4.1-nano)
- **Schema Architect Service**: AI that helps evolve schemas through conversation (gpt-4o-mini)
- **File Repository**: Simple file-based persistence for POC
- **Core Models**: Strongly typed data structures

### Future Full System
- **Telegram Bot**: Multi-user message collection
- **Web Frontend**: Dynamic AI-generated interfaces
- **Microservices**: Scalable service architecture
- **Database**: Production data storage

## Python Code Guidelines

This project follows strict Python development standards:

### Type System
- Use explicit type annotations everywhere (parameters, return types, variables)
- Follow strict mypy configuration - no Any except where necessary
- Mark non-public members with leading underscore (`_`) and prefer encapsulation
- Avoid union types - prefer single concrete types through proper design
- Trust the type system - avoid excessive defensive programming

### Design Patterns
- Follow dependency injection using dependency_injector (ready for implementation)
- Use dataclasses for data containers with proper field typing
- Avoid optional parameters, default values, fallback logic
- Use explicit exception handling with proper types

### Best Practices
- Design for testability with clear dependency boundaries
- Use strongly typed configuration classes
- Don't catch exceptions just to log and re-raise
- Trust interfaces and models - don't add unnecessary checks
- Don't do workarounds - fix root problems or ask for guidance

## Current POC Commands

### Development Setup
```bash
# Install with dependencies
pip install -e .

# Environment variables (from .env)
OPENAI_API_KEY=your-key-here
INTERPRETER_MODEL=gpt-4.1-nano
ARCHITECT_MODEL=gpt-4o-mini
```

### Available Commands
```bash
# Check system status
economy-poc status

# Process messages with current schema (Feed Mode)
economy-poc feed-mode

# Interactive schema evolution session
economy-poc migration-session
```

### File Structure
```
data/
├── messages.txt                    # Input messages (one per line)
├── current_schema.json            # JSON Schema definition
├── cookbook.md                    # Interpretation guidelines
├── current_interpretations.json   # Structured data output
├── architect_instructions.md      # Schema Architect AI prompts
├── interpreter_instructions.md    # Interpreter AI prompts
└── migration_session.md          # Conversation logs
```

## AI Instructions Integration

The system uses two specialized AI roles with carefully crafted instructions:

### Interpreter (gpt-4.1-nano)
- **Purpose**: Convert natural language messages to structured JSON data
- **Instructions**: Located in `data/interpreter_instructions.md`
- **Key behaviors**: Accuracy priority, consistency, detailed feedback, schema compliance
- **Modes**: Feed Mode (new messages) and Reprocessing Mode (schema migration)

### Schema Architect (gpt-4o-mini)  
- **Purpose**: Help users evolve schemas through conversation
- **Instructions**: Located in `data/architect_instructions.md`
- **Key behaviors**: User-centered design, contextual continuity, migration guidance
- **Process**: Interactive conversation → schema proposal → preview → commit

## Development Priorities

### Current POC Validation
1. Test schema evolution conversation flow
2. Validate interpretation quality and consistency
3. Verify contextual continuity during migrations
4. Assess feedback mechanisms effectiveness

### Next Implementation Phases
1. **FastAPI + Swagger**: RESTful API layer
2. **Web UI**: Dynamic interface generation
3. **Telegram Bot**: Multi-user message collection
4. **Production Database**: Replace file storage
5. **Microservices**: Service separation and scaling

## Key Design Principles

### Schema Evolution Philosophy
- Schemas emerge organically from user conversation
- AI maintains contextual continuity (familiar entity names, consistent decisions)
- Migration is conversation-driven, not technical configuration
- Users preview changes before committing

### AI-First Architecture
- AI generates UIs dynamically based on user needs
- No fixed templates - everything adapts to user mental models
- Multiple "glance angles" of same data based on user preferences
- Transparent AI reasoning and decision-making

### User Experience Focus
- Natural language interaction throughout
- Non-technical users can manage complex data schemas
- Intuitive conversation flows over technical interfaces
- Full transparency in AI decision-making

## Important Implementation Notes

- **Model Selection**: Different AI models optimized for different tasks
- **Type Safety**: Strict typing enables confident refactoring and extension
- **Testability**: Protocol-based interfaces allow easy mocking and testing
- **Microservices Ready**: Clean separation supports future service boundaries
- **File-Based POC**: Simple persistence for concept validation before database complexity

## Development Memories
- For running tests, use `source venv/bin/activate` command