# Clarifications & Extended Requirements

This document contains detailed clarifications gathered through Q&A sessions to supplement intro.md.

## User Onboarding Flow
- Users discover and add the Telegram bot independently
- No guided setup process - users immediately start messaging naturally
- Schema and preferences emerge organically through conversation

## Multi-Modal Message Processing
- Voice messages supported in any language using OpenAI transcription models
- Images processed by multi-modal AI (GPT-4o, o3-mini) for visual understanding, not text extraction
- Single Telegram messages can contain both image and text
- AI interprets complete context including visual information from receipts, bills, screenshots

## Telegram Forum & Thread Architecture
- Users can create Telegram forums with multiple threads for different purposes
- Thread purposes are user-defined (e.g., daily expenses, schema setup, AI training)
- Different AI agents operate in different threads with specialized behaviors
- Main coordination thread with manager/reception agent for mode switching and general discussions

## Conversation Modes & Agent Behavior
- Silent mode: bot processes but doesn't respond
- Conversation mode: bot asks clarifying questions and provides feedback
- Mode switching handled through main coordination agent
- Multiple specialized AI agents with different roles operating across threads

## AI-Driven User Preference Learning
- No hardcoded settings - all preferences learned through conversation
- AI agents gather and remember user convenience preferences
- Behavior adapts based on learned preferences (e.g., when to ask questions vs. make assumptions)
- Preference learning is contextual and dynamic

## Threaded Context & Historical Updates
- Users can reply to any historical message in Telegram thread
- AI updates specific interpretations when users add context to old messages
- Web UI allows clicking on data elements to add context or corrections
- Rich web interface shows conversation threads alongside structured interpretations

## Schema Evolution & Rule Learning
- When users reclassify items ("coffee should be 'food'"), AI applies change to all historical data
- AI contextually decides whether to remember rules for future use
- Learned categorization rules are visible and editable by users
- Rule application happens automatically but can be reviewed/modified

## View Generation & Real-Time Collaboration
- AI agents build views and dashboards dynamically based on user requests
- Agents may send links to newly created views
- AI can see results of its changes to iterate and improve
- Users may observe AI work in real-time
- Views persist and automatically update with new data

## Error Correction & Data Consistency
- Contradictory information resolved logically (later statement overwrites earlier)
- For ambiguous cases, main coordination agent asks for clarification
- AI handles partial corrections through conversation ("that amount was $25 not $20")
- Correction scope determined through user discussion with AI

## Rollback & Version Management
- Rollback available at both view level (dashboard changes) and interpretation level (data changes)
- Unlimited rollback history maintained
- Users can revert AI agent changes if results are unsatisfactory

## Export & Integration
- Google Sheets synchronization on demand
- Users can adjust export logic by talking to AI
- Schema changes automatically update existing integrations
- Export configurations learned and maintained through conversation

## Scale & Performance
- System designed to handle thousands of messages per year per user
- No archiving or compression of old interpretations needed
- Real-time processing and view updates expected

## Dynamic AI Team Management System
- Users manage their own virtual AI company with personalized agent team
- Main manager agent has initial personality, routes users to specialist agents
- Manager assigns roles based on understanding and conversation with user
- Users can request new agent roles and system creates them after discussion
- Specialist agents start with manager-assigned roles but can evolve

## Agent Lifecycle & Customization  
- Users can rename agents and assign personalities ("make expense tracker more strict")
- Agents can be "fired" and replaced if user is unsatisfied
- Agents remember full conversation history but compact memory over time
- Agents can suggest their own role changes based on observed user patterns
- Role evolution through discussion - agents may argue but ultimately obey user

## Agent Communication & Transparency
- All agent-to-agent communication visible to users for full transparency
- When agents disagree or need coordination, discussions happen openly
- Users have access to all agent logs - simple but comprehensive logging system
- Agent conversations and decisions are part of the user experience

## Telegram Thread Organization
- Each agent typically gets own Telegram thread for specialized communication
- Users can create additional threads and assign existing agents to them
- Manager agent decides thread routing and agent assignment
- Users can override and reorganize agent-thread assignments as needed

## Agent Coordination Technical Details
- Parallel processing across users (complete isolation)
- No rate limiting on message processing or AI requests
- Agent collaboration and handoffs managed dynamically
- Context and learning shared within user's agent team

## Authentication & Security
- Persistent login sessions from bot-provided links to web UI
- Google authentication option for web UI access
- Complete user isolation - no visibility of other users' existence

## System Configuration & AI Models
- Admin configures AI models (GPT-4o, o3-mini) via config files for all users
- AI model upgrades preserve old interpretations rather than re-interpreting
- No user choice of AI models - system-wide configuration

## Data Validation & Error Handling
- Real-time schema validation prevents bad changes
- AI agents attempt auto-fix on validation errors, then consult user
- Message processing failures queue for retry when AI services recover
- System health monitoring visible to users (processing delays, AI status)

## User Discovery & Access
- Users find bot via username search or website links
- No user limits or abuse prevention initially
- Multi-user support required from day one

## View Management & UI Behavior
- AI-generated views are separate pages with persistent URLs
- No automatic cleanup - views persist indefinitely
- Favorites system for prominently displaying preferred views
- Real-time auto-updates when new data arrives (no manual refresh)
- No push notifications for new views or AI questions

## Export & Integration Extensions
- Google Sheets export as raw data tables (not formatted reports)
- Export system designed to be extensible for future formats
- Export configurations maintained through AI conversation

## System Dependencies
- Requires online AI services - no offline AI processing
- Web UI viewing may work partially offline
- Hosting via Docker or cloud deployment (not cloud-dependent architecture)
- No offline message processing capabilities