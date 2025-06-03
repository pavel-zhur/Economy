# UI Proof of Concept - Web Interface for Schema Evolution

This POC builds on the console-based schema evolution system by adding a web interface, API layer, and database persistence to validate the full user experience before implementing the Telegram bot integration.

## Core Concept

Migrate the file-based console POC to a web-based system with proper persistence, allowing users to interact with schema evolution through a modern web interface while maintaining all the core functionality.

## Architecture Overview

### Technology Stack
- **Frontend**: React SPA (single-page application)
- **Backend**: FastAPI with Python
- **Database**: PostgreSQL with JSON storage
- **Deployment**: Docker containers
- **Authentication**: Google OAuth (planned), hardcoded user (current POC)

### Container Architecture
- **React SPA Container**: Static hosting of the web interface
- **FastAPI Container**: RESTful API server
- **PostgreSQL Container**: Database persistence
- **Shared Volumes**: Mounted instruction files for AI agents

## Database Design

### User-Scoped Data Model
All data is user-isolated with JSON storage for flexibility:
- `users` - Google-based user accounts (future)
- `schemas` - User schema definitions with full version history
- `cookbooks` - User interpretation guidelines with version history  
- `messages` - User input messages with timestamps
- `interpretations` - AI-generated structured data with message links
- `migration_sessions` - Schema evolution conversation history

### Version History & Diffs
- Complete historical preservation for all data changes
- Designed for easy diff views and rollback capabilities
- JSON storage maintains schema flexibility while enabling version comparison

## Authentication Strategy

### Current POC Phase
- **No Frontend Authentication**: Direct access to the React SPA
- **Hardcoded Backend User**: Single user ID configured via environment variable
- **Simplified Development**: Focus on core functionality without auth complexity

### Future Implementation
- **Google OAuth Integration**: React SPA handles OAuth flow directly
- **Token-Based API**: FastAPI receives and validates Google tokens
- **Multi-User Support**: Full user isolation with Google account linking

## API Design

### RESTful Endpoints
- `/schemas` - Current schema and version history management
- `/cookbooks` - Interpretation guidelines management
- `/messages` - Message input and retrieval
- `/interpretations` - Structured data output and reprocessing
- `/migration-sessions` - Schema evolution conversation management
- `/feed-mode` - Live message processing
- `/status` - System health and configuration

### Real-Time Updates
- Polling-based updates for interpretation results
- WebSocket support planned for future enhancement

## Web Interface Features

### Core Functionality Migration
All console POC capabilities available through web UI:
- **View Current State**: Schema, cookbook, messages, interpretations
- **Feed Mode Processing**: Submit new messages for interpretation
- **Migration Sessions**: Interactive schema evolution with chat interface
- **Message Context**: Add details and corrections to historical messages

### Enhanced UI Components
- **Chat Interface**: Migration session conversations with AI
- **Diff Views**: Side-by-side comparison of schema and cookbook versions
- **JSON Visualization**: Structured data display with editing capabilities
- **Version History**: Timeline view of all changes with rollback options

### User Experience Focus
- **Beautiful Design**: Modern, intuitive interface (design by separate AI agent)
- **Popular React Components**: Error-proof, well-maintained libraries
- **Responsive Layout**: Desktop and mobile friendly
- **Real-Time Feedback**: Live updates during AI processing

## File System Integration

### Instruction Management
- **AI Instructions**: Mounted as Docker volumes from `data/` directory
- **Admin-Controlled**: Interpreter and architect instructions remain file-based
- **Version Controlled**: Instructions updated through code deployment

### Data Migration
- **Preserve POC Data**: Import existing messages, schema, cookbook to database
- **Seamless Transition**: Maintain all current functionality
- **Enhanced Persistence**: Reliable storage with backup capabilities

## Development Environment

### Docker Composition
- **Local Development**: `.env` file configuration for API keys and settings
- **Container Orchestration**: Docker Compose for service coordination
- **Hot Reload**: Development-friendly container setup
- **Environment Isolation**: Clean separation between development and production

### Configuration Management
- **OpenAI API Keys**: Environment variable configuration
- **Database Connection**: Standard PostgreSQL connection strings
- **User Settings**: Hardcoded user ID for POC phase

## POC Goals & Validation

### Technical Validation
- **Database Performance**: JSON storage efficiency for schema evolution
- **API Responsiveness**: Real-time interpretation processing
- **UI Usability**: Intuitive schema evolution workflow
- **Container Reliability**: Stable multi-service deployment

### User Experience Testing
- **Migration Session Flow**: Chat-based schema design feels natural
- **Diff Visualization**: Schema changes are clearly understandable
- **Version Management**: Historical data and rollback capabilities work smoothly
- **Real-Time Feedback**: Processing status and results display effectively

### Success Criteria
- **Feature Parity**: All console POC functionality available through web UI
- **Enhanced Experience**: Web interface improves upon console limitations
- **Stable Foundation**: Ready for Google authentication and multi-user extension
- **Performance Validation**: System handles realistic data volumes efficiently

This POC validates the web-based user experience and technical architecture before implementing the full Telegram bot integration and multi-user system.