# Personal Budget Tracker

I'm creating a personal budget tracker with the following components:

## Data Collection
- A Telegram group with a bot that sees and remembers all my messages
- In the thread, I'll write my expenses and plans in natural language: wallets, revisions, conversions, plans, future allocations, planned purchases, actual transactions, funds for purposes, and decisions about which fund/planned purchase the actual transactions correspond to
- I don't want to talk to a bot - it doesn't need to write to me
- I just want to express what I'm doing in natural language, including voice messages and images of bills
- The bot will read and store all of this information

## Data Processing
- A separate component will process the collected data
- I'll choose the AI model to interpret my texts, voice messages, etc., into structured data
- These structured interpretations will be applied to my financial database
- I want to be able to see these structured interpretations and re-run the processor when it makes mistakes
- I'll train the AI until it understands me well
- I need to be able to reprocess some or all of my messages
- I want to be able to add more details to messages (in the chat by replying to them or in the GUI)

## User Interface
- A web frontend where I can see and manage everything

## Database & Architecture
- A database with appropriate entities
- Possibly event sourcing or another appropriate pattern
- Freedom to reapply or add more details to messages is important, as AI will initially interpret them incorrectly
- I want to indicate which results I like and which I don't, and apply fixes by adding details in natural language/voice
- I want to be able to modify instructions to the AI interpreter and regenerate structured outputs for my message history (entire or partial)
- I want to iterate multiple times until results are stable with minimal errors

## Reporting
- Different kinds of reports based on the data
- Ability to view the structured data source

## Technical Stack
- Docker
- Python
- Microservices
- PostgreSQL
- Modern web frontend
- Grafana with logs (Loki)
- Dashboards injectable into the web frontend where needed
- Desktop and mobile friendly
- Azure DevOps Pipeline for building
- Azure hosting

## Testing
- Unit and integration tests to ensure project stability

## Multi-User Support
- The system should support multiple users
- One bot serves multiple users
- Each user creates their own chat with the bot
- The bot sends a login link for the web frontend to each user

## Schema Flexibility
- Every user should have their own schema of structured data
- The schema should be flexible, not rigid
- Different users may have different kinds of entities
- The application should be domain-agnostic from a code perspective
- Users can manage what they want and adjust the schema to their needs
- Users define and modify schemas only through natural language interaction with the AI
- Schema definition happens via the Telegram bot (in a separate thread or forum) or through the web UI
- All schema modifications are done by communicating to the AI in text/voice/images

## User-Specific AI Training
- Each user should be able to adjust the AI to understand their specific language
- Users can iteratively adjust the AI until it reliably understands them
- Each user can have their own reports
- Users can save their configuration "presets" and modify them
- AI training happens through natural dialog with the user
- Users should immediately see the consequences of their instructions to the AI
- Users can modify AI instructions in text form
- The AI should help users manage these instructions
- Users may want to manually edit instructions in some cases

## Schema Evolution
- Users need to be able to retrain/adjust AI instructions and schema while preserving existing data
- The schema should be flexible and modifiable during the system's lifetime
- Existing data must be preserved when schema changes occur
- Users should not lose data when making schema adjustments

## Three-Layer Architecture
- The system has a clear separation between schema layer, AI instructions layer, and data layer
- Users have full control and observability across all three layers
- Users can review, approve, or reject reprocessing results
- Users can revert changes to the schema, AI instructions, or the data itself
- The system provides visibility into all changes and their impacts
