# Testing Instructions - Economy A5 Specific

Project-specific testing requirements for AI-powered expense tracking services.

## OpenAI Integration Specifics

### Configuration
```bash
# tests/.env
TEST_MODE=verify_all  # record_all, verify_ai_record_tests, verify_all
OPENAI_API_KEY=your-key-here
TEST_INTERPRETER_MODEL=gpt-4o-mini
TEST_ARCHITECT_MODEL=gpt-4o-mini
```

### OpenAI Mock Infrastructure
- Drop-in replacement for OpenAI client
- Multi-call support with numbered fixtures (`openai_request_2.json`, etc.)
- Automatic request/response capture and validation

## AI Service Testing Standards

### Interpreter Service Testing
- **Feed Mode**: Test interpretation accuracy with realistic expense data
- **Reprocessing Mode**: Test schema migration with context preservation
- Validate confidence levels and warnings for ambiguous expense inputs
- Test structured data extraction (amounts, merchants, categories)

### Schema Architect Service Testing
- **Migration Sessions**: Multi-turn conversations for schema evolution
- **Context Preservation**: AI remembers user's specific expense patterns across turns
- **Schema Proposal Extraction**: Valid JSON schema generation from conversation
- Test conversation coherence with incremental building on AI suggestions

## AI Quality Validation

### Semantic Testing Requirements
- Test AI understanding of expense patterns, not just conversation structure
- Validate AI references user's actual data (specific merchants, amounts)
- Test contextual coherence across multi-turn conversations
- Verify AI builds incrementally on previous suggestions

### Schema Evolution Testing
- Test old schema → new schema progression
- Validate familiar entity names preserved during migration
- Test conversation-driven migration (not technical configuration)
- Verify schema proposals work with user's actual expense data

## Fixture Structure

### Project-Specific Files
```
tests/fixtures/
├── interpreter/
│   ├── input_messages.txt         # Expense messages
│   ├── schema.json               # Expense tracking schema
│   ├── cookbook.md              # Interpretation guidelines
│   ├── openai_request.json       # Captured OpenAI request
│   ├── openai_response.json      # Captured OpenAI response
│   └── expected_output.json     # Expected interpretations
└── architect/
    ├── conversation_turns/       # Multi-turn fixtures
    ├── openai_request_N.json    # Numbered for multi-call
    └── openai_response_N.json
```

## Service Integration Testing

### Architect + Interpreter Collaboration
- Test services working together during schema migration
- Validate reprocessing with new schemas from architect
- Test context preservation between services

### File Repository Integration
- Test loading/saving across JSON, MD, TXT formats
- Validate expense data persistence patterns
- Test schema system file operations

## Model Configuration

### AI Model Consistency
- Use gpt-4o-mini for both interpreter and architect in tests
- Match model configuration from actual service deployment
- Test with models specified in Economy A5 architecture

### Cost-Effective Development
- Use VERIFY_AI_RECORD_TESTS mode for code fixes without API calls
- Manual review of captured AI responses before committing fixtures
- Three-mode system optimized for OpenAI API cost management