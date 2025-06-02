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
- A dynamic web frontend that generates views based on user conversation with AI
- Users describe their preferred "glance angles" and the AI builds appropriate UI components
- No fixed templates - interfaces are generated on demand (tables, charts, forms, reports)
- Multiple representations of the same data based on user's mental model and current needs

## Database & Architecture
- Simple, reliable data storage for structured interpretations (schema changes will be rare and mostly compatible)
- AI layer handles the complexity of interpretation, UI generation, and context preservation
- Freedom to reapply or add more details to messages is important, as AI will initially interpret them incorrectly
- I want to indicate which results I like and which I don't, and apply fixes by adding details in natural language/voice
- I want to be able to modify instructions to the AI interpreter and regenerate structured outputs for my message history (entire or partial)
- I want to iterate multiple times until results are stable with minimal errors

## Data Storage Challenges
- I'm concerned about data storage, schema flexibility, and evolution
- The system needs excellent observability
- Reports and views must be easy to maintain when schema evolves
- It should be very easy to revert changes when needed
- I want a storage solution that is extremely flexible and minimizes struggles for users
- The solution must be open source and deployable via Docker (no cloud-native services)
- Users are not necessarily technical people, so the experience must be intuitive

## Reporting
- Different kinds of reports based on the data
- Ability to view the structured data source
- Easy export and synchronization (one way) into Google Sheets is crucial

## Technical Stack
- Docker
- Python
- Microservices
- Modern web frontend
- Grafana with logs (Loki)
- Dashboards injectable into the web frontend where needed
- Desktop and mobile friendly
- Azure DevOps Pipeline for building
- Azure hosting
- Open source storage solutions only (no cloud-native services)

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
- Schema changes must be painless - users should never struggle with migrations or compatibility issues

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
- Schema evolution should be effortless for non-technical users

## Three-Layer Architecture
- The system has a clear separation between schema layer, AI instructions layer, and data layer
- Users have full control and observability across all three layers
- Users can review, approve, or reject reprocessing results
- Users can revert changes to the schema, AI instructions, or the data itself
- The system provides visibility into all changes and their impacts

## Managing AI Interpretations
- Users iterate with the AI until interpretations become good enough to leave alone
- Users don't explicitly mark interpretations as "good" or "bad" - they simply stop fixing ones that work
- When schema changes or AI instructions are updated, previously working interpretations may break
- The system should be context-aware during reinterpretation to preserve what was working

## Smart Reinterpretation Approach
- The AI should know what the previous interpretation looked like before making a new one
- Previous interpretations serve as context to maintain continuity rather than starting from scratch
- The goal is to preserve working elements while adapting to new schema/instruction changes
- This prevents unnecessary breakage of interpretations that users had already accepted

## Contextual Continuity During Reinterpretation  
- Previous interpretations are available to the AI during reinterpretation to provide context
- The AI should maintain consistency in entity names, visual attributes, hierarchical decisions
- Arbitrary but consistent decisions from previous interpretations should be preserved when possible
- Users can talk to the AI about context preservation vs evolution preferences
- The AI generates multiple views of the same data based on user's mental model and comfort level
- This context-awareness is crucial for user trust and system reliability