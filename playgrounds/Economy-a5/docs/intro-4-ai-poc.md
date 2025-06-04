# AI Proof of Concept - Core Schema Evolution System

This POC tests the fundamental concept of AI-driven schema evolution and data interpretation to validate if the core idea works before building the full system.

## Core Concept

Users provide daily logs (text, voice, images) that get interpreted into structured data according to a user-defined schema. When users want to evolve their schema, they engage in a conversation with an AI that helps redesign the schema while maintaining data continuity.

## POC Components

### 1. Input Messages
- Users provide input messages via a simple text file (one message per line)
- Messages represent daily logs, events, expenses, plans, or any natural language content
- Messages may contain rich information or minimal details
- New messages arrive frequently (multiple times per day)

### 2. Current Schema System
- **Schema** (JSON Schema format) - defines the structured data format
- **Cookbook** (Markdown file) - interpretation guide with explanations, hints, and parsing instructions
- **Schema + Cookbook = Complete interpretation framework**

### 3. The Interpreter
- Function that operates in two modes: **Feed Mode** and **Reprocessing Mode**

#### Feed Mode
- Processes new incoming messages as they arrive
- Receives: new messages + current schema
- Generates new structured interpretations conforming to the schema
- Produces **Feedback** for each message and overall concerns
- Daily/ongoing operation for live message processing

#### Reprocessing Mode  
- Used during Migration Sessions for schema evolution preview
- Receives: existing messages + new schema + old schema + old interpretations
- Reprocesses historical messages with new schema while maintaining contextual continuity
- Produces **Feedback** for each message and overall concerns:
  - Message-linked feedback for specific parsing issues
  - Overall thoughts about interpretation confidence
  - Warnings when unable to correctly generate structured data
- Generates interpretations anyway, even with low confidence

### 4. Schema Architect
- AI role that facilitates schema evolution conversations
- Sees current schema, cookbook, some messages, and existing interpretations
- Goal: collaborate with user to design new schema and interpretation guidelines
- Receives Interpreter feedback and decides next actions based on results

## Migration Session Workflow

### Initial State
- Messages + Current Schema → Structured Interpretations (working system)

### Schema Evolution Process
1. **Migration Session Begins**
   - User initiates conversation with Schema Architect about desired changes
   - Schema Architect analyzes current schema, cookbook, and sample data

2. **Design Phase**
   - Schema Architect proposes new Schema (JSON) + new Cookbook (MD)
   - Collaborative conversation to refine the design

3. **Preview Mode**
   - Interpreter processes existing messages using new schema
   - Receives: messages + new schema + old schema + old interpretations (for continuity)
   - Generates new interpretations while maintaining recognizable context (same entity names, etc.)
   - Produces detailed Feedback about parsing issues and confidence levels

4. **Review & Iteration**
   - Schema Architect receives Interpreter feedback and new interpretations
   - Decides whether to:
     - Declare readiness and recommend commit
     - Revise Schema/Cookbook and re-run Preview
     - Ask user for guidance on specific nuances or unresolvable issues
   - User reviews preview results and provides input

5. **Commit or Continue**
   - If satisfied: User commits changes, new schema becomes current
   - If not satisfied: Return to Design Phase with learned insights
   - Previous schema becomes historical (may be saved but not actively used)

## POC Goals & Validation

### Test Questions
- Does the Schema Architect effectively understand user intent and design appropriate schemas?
- Can the Interpreter maintain contextual continuity during schema migrations?
- Are the Feedback mechanisms sufficient for identifying and resolving interpretation issues?
- Is the conversation-driven schema evolution intuitive and effective?
- Do the interpretation hints and cookbook format provide adequate guidance?

### Success Criteria
- User can successfully evolve schema through natural conversation
- Interpretations maintain recognizable context across schema changes
- Feedback helps identify and resolve interpretation problems
- Process feels intuitive and produces satisfactory results


## Technical Implementation Notes

- User cannot directly modify the schema (only through Schema Architect conversation)
- User can view all files to understand current state
- Interpreter feedback flows back to Schema Architect for decision making
- Focus on testing the conversational schema evolution concept
- Emphasis on maintaining user orientation during changes (familiar entity names, consistent structure)

This POC validates whether the core AI-driven schema evolution concept is viable before investing in the full multi-user, web-based system.