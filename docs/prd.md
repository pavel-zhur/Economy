# Product Requirements Document: Personal Budget Tracker

## 1. Product Overview
A multi-user budget tracking system that uses natural language processing to interpret financial activities described in Telegram messages. The system will capture, process, and organize data based on casual conversations, voice messages, and images shared in Telegram groups. Each user can customize the AI and data schema to fit their specific needs.

## 2. Target User
Individuals managing personal finances who prefer natural language communication over structured data entry, and want a customizable system that adapts to their specific terminology and requirements.

## 3. User Goals
- Track expenses, income, and financial plans with minimal effort
- Maintain financial records without using specialized finance apps or spreadsheets
- Train an AI to understand personal financial terminology and patterns
- Generate useful financial reports and insights
- Customize the system to their specific needs and terminology
- Modify the schema and AI understanding over time without losing data
- Maintain full control over how the AI interprets their communications
- Have complete visibility into all system changes and their effects

## 4. Core Components

### 4.1 Telegram Data Collection
- **Bot Integration**: A Telegram bot that can be added to multiple user groups
- **Multi-User Support**: One bot serves multiple independent users
- **User Onboarding**: Bot provides login links to the web frontend
- **Data Types**: Support for text messages, voice messages, and images (receipts/bills)
- **Silent Observer**: Bot doesn't interact with the user, only collects data
- **Storage**: Secure storage of all raw messages for later processing
- **Structured Communication**: Support for forums or threads to organize different types of communication (e.g., separating schema definitions from regular entries)

### 4.2 AI Processing Engine
- **Natural Language Processing**: Interpret activities from casual language
- **User-Specific Training**: Each user trains their own instance of the AI
- **Voice-to-Text**: Convert voice messages to text for processing
- **Image Recognition**: Extract information from receipts/bills 
- **Entity Recognition**: Identify custom entities as defined by each user
- **Interpretable Output**: Generate structured data from natural language inputs
- **Reprocessing Capability**: Ability to reprocess individual messages or entire history
- **Continuous Learning**: Improve accuracy based on user feedback
- **Configuration Presets**: Allow users to save and modify AI configuration presets
- **Dialog-Based Training**: AI learns through natural conversation with users
- **Immediate Feedback**: Users see the immediate effects of their instructions
- **Text-Based Instructions**: Support for direct text-based AI instruction modification
- **AI-Assisted Configuration**: AI helps users manage and improve their instructions

### 4.3 User Interface
- **Web Dashboard**: Primary interface for viewing and managing data
- **Message Review**: View original messages alongside their interpreted structured data
- **Correction Mechanism**: Ability to correct AI interpretations and add details
- **AI Instruction Management**: Interface to modify/update instructions for the AI processor
- **Schema Management**: Interface to define and modify the user's data schema through natural language
- **Report Generation**: Create and customize reports specific to each user
- **Mobile & Desktop Support**: Responsive design for all device types
- **Reprocessing Review**: Interface to review, approve, or reject reprocessing results
- **Change History**: Visibility into all changes made to schema, AI instructions, and data
- **Rollback Capabilities**: Ability to revert changes at any level of the system

### 4.4 Data Management
- **Multi-Tenant Database**: Separate schema for each user
- **Flexible Schema Design**: Support for user-defined and evolving schemas
- **Data Preservation**: Maintain data integrity during schema changes
- **Event Sourcing**: Track changes and maintain data integrity
- **Reprocessing Infrastructure**: Support for regenerating structured data from raw messages
- **Version Control**: Track changes to AI interpretations, user corrections, and schema evolution
- **Three-Layer Architecture**: Clear separation between schema layer, AI instructions layer, and data layer
- **Layer Synchronization**: Maintain consistency across the three layers during changes
- **Change Transparency**: Provide visibility into how changes in one layer affect the others

## 5. Functional Requirements

### 5.1 Telegram Integration
- Bot must be able to join multiple Telegram groups and capture all messages
- Bot must store text, voice messages, and images
- Bot must operate silently without responding to messages
- Bot must provide users with login links to the web frontend
- System must maintain separation between different users' data
- Bot must support forums or threads for organizing different types of communication

### 5.2 AI Processing
- System must convert raw messages into structured data according to user-defined schemas
- System must allow reprocessing of individual messages or entire message history
- System must support user-provided feedback and corrections
- System must improve accuracy over time based on user corrections
- System must support user-specific modification of AI processing instructions
- System must allow users to save and load AI configuration presets
- System must enable schema definition and modification solely through natural language interaction
- System must provide immediate feedback on how AI instruction changes affect interpretations
- System must support both AI-assisted and manual editing of instructions
- System must maintain a history of instruction changes and their effects

### 5.3 User Interface
- Users must be able to view original messages and their structured interpretations
- Users must be able to correct interpretations or add details
- Users must be able to define and modify their data schema through natural language interactions
- Users must be able to view data in various user-defined report formats
- Interface must be accessible on both mobile and desktop devices
- Users must be able to modify AI processing instructions
- Users must be able to trigger reprocessing of messages
- Users must be able to review, approve, or reject reprocessing results before they're applied
- Users must have visibility into the system's three-layer architecture (schema, instructions, data)
- Users must be able to revert changes to any layer of the system
- Interface must clearly show the relationship between original messages and structured data

### 5.4 Data Management
- System must maintain integrity of raw message data
- System must track all changes to interpretations, corrections, and schema
- System must ensure database accurately reflects processed data
- System must preserve existing data during schema changes
- System must support flexible, user-defined schemas
- System must provide data migration capabilities when schemas evolve
- System must maintain clear separation between schema layer, AI instructions layer, and data layer
- System must provide full audit trail of changes across all three layers
- System must support reverting changes to any layer while maintaining consistency

### 5.5 Testing Requirements
- System must have comprehensive unit tests for all microservices
- Integration tests must verify communication between components
- End-to-end tests must validate critical user workflows
- Test coverage must meet or exceed 80% for critical components
- Tests must be automated and run as part of the CI/CD pipeline

## 6. Non-Functional Requirements

### 6.1 Performance
- AI processing must complete within reasonable time frames
- Web interface must be responsive with minimal load times
- System must handle large message histories efficiently
- System must support multiple concurrent users
- Reprocessing jobs must be efficiently parallelized
- UI must remain responsive during reprocessing operations

### 6.2 Security
- All user data must be securely stored and isolated from other users
- User authentication required for accessing the system
- Appropriate encryption for sensitive information
- Bot access limited to authorized Telegram groups

### 6.3 Reliability
- System must maintain data integrity during reprocessing and schema changes
- Regular backups of both raw and processed data
- Error handling for failed processing attempts
- Graceful handling of schema migrations
- Automated testing to ensure system stability
- Protection against conflicting concurrent changes
- Ability to rollback to previous states in case of failures

### 6.4 Scalability
- Architecture must support growing message history
- Database design must accommodate increasing data complexity
- System must efficiently support multiple users with diverse needs

## 7. Technical Stack

### 7.1 Core Technologies
- **Containerization**: Docker
- **Backend**: Python-based microservices
- **Database**: PostgreSQL with flexible schema design
- **Frontend**: Modern web framework (React/Vue/Angular)
- **Monitoring**: Grafana with Loki for logs

### 7.2 Development & Deployment
- **Source Control**: Git with feature branch workflow
- **CI/CD**: Azure DevOps Pipelines for build and deployment
- **Testing Framework**: Pytest for backend, Jest for frontend
- **Cloud Platform**: Azure for hosting all services
- **Infrastructure as Code**: Terraform or ARM templates

### 7.3 Azure Services
- **App Service** or **AKS** for microservices hosting
- **Azure Database for PostgreSQL** for data storage
- **Azure Blob Storage** for message and media storage
- **Azure Functions** for event processing
- **Azure Application Insights** for monitoring
- **Azure Key Vault** for secrets management

## 8. Success Criteria
- AI interpretation achieves >95% accuracy after user-specific training
- Users are able to generate meaningful personalized reports
- System successfully tracks activities according to user-defined schemas
- Users can effectively manage data using only natural language input
- Schema changes preserve existing data integrity
- Multiple users can use the system concurrently without interference
- All automated tests pass in the CI/CD pipeline
- Users can successfully control and observe all three system layers
- Users can confidently revert changes when needed

## 9. Future Considerations
- Integration with other messaging platforms
- Direct connections to external APIs
- Advanced planning features
- More sophisticated schema migration tools
- Community-shared AI configuration presets 