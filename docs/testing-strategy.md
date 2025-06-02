# Testing Strategy for AI Services

This document outlines the testing approach for Economy A5 AI services, focusing on reliable, reusable services with realistic test data captured from actual OpenAI API responses.

## Core Testing Philosophy

### Objectives
- Build well-tested, reusable AI services that can be trusted in production
- Use real AI responses as test fixtures to ensure realistic behavior
- Maintain test independence and fast execution without API dependencies
- Validate both service logic and AI integration points comprehensively

### Key Principles
- **Real Data Testing**: Use actual OpenAI responses captured as fixtures
- **Test Independence**: Each test has its own isolated fixture set
- **Dual Mode Operation**: Record real responses OR replay from fixtures
- **Comprehensive Validation**: Test both requests sent and responses received
- **Minimal Service Changes**: Services remain clean, testing infrastructure handles complexity

## Testing Architecture

### Two-Mode Testing System

#### Record Mode (Development/Fixture Creation)
- Tests call actual OpenAI API
- Capture both requests and responses automatically
- Save responses to test-specific fixture files
- Allow manual validation of captured data quality
- Used when creating new tests or updating fixtures

#### Replay Mode (CI/Normal Development)
- Tests use saved fixture responses
- Validate request parameters match expectations
- Fast execution without API calls
- Deterministic results for reliable CI/CD

### Test Structure

```
tests/
├── services/
│   ├── test_interpreter_service.py
│   ├── test_schema_architect_service.py
│   └── fixtures/
│       ├── interpreter/
│       │   ├── test_feed_mode_basic/
│       │   │   ├── request.json
│       │   │   ├── response.json
│       │   │   ├── input_messages.txt
│       │   │   ├── schema.json
│       │   │   └── cookbook.md
│       │   ├── test_reprocessing_mode/
│       │   └── test_invalid_response_handling/
│       └── architect/
│           ├── test_migration_session_start/
│           ├── test_conversation_continue/
│           └── test_schema_proposal_extraction/
├── utils/
│   ├── openai_mock.py          # OpenAI client mock
│   ├── fixture_manager.py      # Fixture recording/playback
│   └── test_config.py          # Test mode configuration
└── conftest.py                 # Pytest configuration
```

## Implementation Components

### 1. OpenAI Mock Service

**Purpose**: Intercept OpenAI calls and route to recording or playback

**Features**:
- Drop-in replacement for OpenAI client
- Automatic request/response capture in record mode
- Request validation and response playback in replay mode
- Support for different OpenAI models and configurations

**Key Methods**:
```python
class OpenAIMock:
    def __init__(self, test_name: str, mode: TestMode)
    def chat_completions_create(self, **kwargs) -> ChatCompletion
    def _record_interaction(self, request: dict, response: dict)
    def _replay_interaction(self, request: dict) -> dict
    def _validate_request_match(self, current: dict, recorded: dict)
```

### 2. Fixture Manager

**Purpose**: Handle test fixture file operations and validation

**Features**:
- Organize fixtures by test name and service
- Support multiple file formats (JSON, MD, TXT, etc.)
- Validate fixture completeness and quality
- Provide clear error messages for fixture mismatches

**File Types Supported**:
- `request.json` - OpenAI API request parameters
- `response.json` - OpenAI API response data
- `input_messages.txt` - Sample user messages
- `schema.json` - JSON schema definitions
- `cookbook.md` - Interpretation guidelines
- `instructions.md` - AI service instructions
- `expected_output.json` - Expected service results

### 3. Test Configuration

**Purpose**: Control testing modes and fixture behavior

**Configuration via Environment Variables** (tests/.env):
```bash
# Default mode - no real API calls, strict validation
OPENAI_MOCK_MODE=verify_readonly
FIXTURE_ASSERT_MODE=verify_readonly

# First-time mode - records API calls and responses
# OPENAI_MOCK_MODE=record_overwrite
# FIXTURE_ASSERT_MODE=record_overwrite

# Mixed mode - when fixing tests or code changes behavior
# OPENAI_MOCK_MODE=verify_readonly     # Keep existing API responses
# FIXTURE_ASSERT_MODE=record_overwrite # Update expected outputs
```

**Configuration Options**:
```python
class OpenAIMockMode(Enum):
    RECORD_OVERWRITE = "record_overwrite"  # Call real API, save request/response
    VERIFY_READONLY = "verify_readonly"    # Use saved responses, validate requests

class FixtureAssertMode(Enum):
    RECORD_OVERWRITE = "record_overwrite"  # Update expected outputs, no assertion errors
    VERIFY_READONLY = "verify_readonly"    # Strict validation against saved outputs
```

**Workflow**:
1. **First execution**: Set both modes to `record_overwrite`
2. **Record everything**: Run tests to capture API calls and expected outputs
3. **Manual validation**: Review all generated fixture files for quality
4. **Switch to readonly**: Change both modes to `verify_readonly`
5. **Verify tests**: Re-run to ensure tests pass in readonly mode
6. **Code changes**: Use mixed mode to update only expected outputs when behavior changes

## Test Implementation Guidelines

### Service Test Structure

Each service test should follow this pattern:

```python
class TestInterpreterService:
    def test_feed_mode_basic_expenses(self, fixture_manager, openai_mock):
        # Arrange
        messages = fixture_manager.load("input_messages.txt")
        schema_system = fixture_manager.load_schema_system()
        
        service = InterpreterService(openai_mock.config, instructions)
        
        # Act
        result = service.process_feed_mode(messages, schema_system)
        
        # Assert
        fixture_manager.validate_output("expected_output.json", result)
        assert len(result.interpretations) > 0
        assert all(interp.schema_version == "1.0" for interp in result.interpretations)
```

### Fixture File Organization

**Per-Test Isolation**: Each test gets its own fixture directory with multiple small files
```
test_feed_mode_basic_expenses/
├── input_messages.txt         # Input data
├── schema.json               # Schema definition (can be old/simple)
├── cookbook.md              # Interpretation guide
├── openai_request.json       # Captured OpenAI request
├── openai_response.json      # Captured OpenAI response
└── expected_output.json     # Expected service output
```

**Schema Evolution Tests** (only for schema evolution functions):
```
test_architect_schema_migration/
├── old_schema.json
├── old_interpretations.json
├── conversation_turns/
│   ├── turn_01_request.json
│   ├── turn_01_response.json
│   ├── turn_02_request.json
│   ├── turn_02_response.json
├── new_schema.json
└── expected_migration_result.json
```

**Principle**: One schema per test unless testing schema evolution specifically. Schema can be old/simple - tests focus on service behavior, not schema currency.

### Test Categories

**Primary Focus: Integration Tests** - Best ROI with minimal code and thorough validation

#### 1. Core Integration Tests
- **Interpreter Service**: Feed mode and reprocessing mode with real file operations
- **Schema Architect Service**: Conversation flows and schema proposals
- **File Repository**: Loading/saving across different file formats
- **Service Collaboration**: Architect + Interpreter working together

#### 2. Input Validation Tests
- **Valid Inputs**: Test correct behavior with well-formed data
- **Invalid Inputs**: Test proper error handling and failure modes
- **Principle**: Services should validate inputs heavily and raise clear errors for nonsensical data

#### 3. Edge Cases (Important but Not Paranoid)
- **Boundary Conditions**: Empty lists, single items, maximum reasonable sizes
- **Error Scenarios**: Malformed AI responses, missing files, network issues
- **Real-World Variations**: Different message patterns, schema complexities

#### 4. Schema Evolution Tests (Specialized)
- **Only for schema evolution functions**: Migration workflows, context preservation
- **Multi-turn conversations**: Complex architect interactions

**Testing Philosophy**: 
- Code should fail fast for invalid inputs (null instead of list, etc.)
- Tests verify correct work for correct inputs
- Tests verify proper failures for incorrect inputs
- Don't design super-stability for unrealistic scenarios

## Quality Assurance Process

### Fixture Validation Workflow

1. **Record Mode Execution**:
   ```bash
   # Set both modes to record_overwrite in tests/.env first
   pytest tests/services/test_interpreter_service.py::test_feed_mode_basic
   ```

2. **Manual Fixture Review** (Critical Step):
   - Inspect `openai_response.json` for coherent AI responses
   - Validate `expected_output.json` contains sensible interpretations
   - Check `openai_request.json` parameters match service configuration
   - Verify markdown files (instructions, cookbook) are well-formed
   - **If anything looks wrong**: Raise clear errors and fix the issue

3. **Quality Checklist**:
   - [ ] Fixture files are not empty
   - [ ] JSON files are valid and properly formatted
   - [ ] AI responses are coherent and relevant
   - [ ] Expected outputs match business logic
   - [ ] No API keys or sensitive data in fixtures
   - [ ] File paths and names are consistent

4. **Switch to Readonly Mode**:
   ```bash
   # Change both modes to verify_readonly in tests/.env
   pytest tests/services/test_interpreter_service.py
   ```

5. **Mixed Mode for Code Changes**:
   ```bash
   # When code behavior changes, update only expected outputs:
   # OPENAI_MOCK_MODE=verify_readonly
   # FIXTURE_ASSERT_MODE=record_overwrite
   pytest tests/services/test_interpreter_service.py
   ```

### Continuous Integration

**CI Pipeline Requirements**:
- All tests run with `OPENAI_MOCK_MODE=verify_readonly` and `FIXTURE_ASSERT_MODE=verify_readonly`
- No actual API calls in CI environment
- Fixture files committed to repository
- Failed tests provide clear fixture mismatch details

**Fixture Update Process**:
- Developers run record_overwrite mode locally for new/changed tests
- **Manual review of generated fixtures is required**
- Updated fixtures committed with test changes
- Team review for fixture quality before merge
- No automated fixture validation - rely on manual review and clear error messages

## Additional Considerations

### AI Model Selection
- **Stick to one model** for consistency across tests (e.g., gpt-4o-mini)
- Use the same model that's configured for the service being tested
- No need to test multiple model variations

### Privacy and Security
- Fixture files contain AI responses and are committed to repository
- **Never store API keys** in fixture files or tests
- API keys remain in root .env file only
- AI responses typically don't contain sensitive information in this domain

### Fixture Maintenance
- **Multiple small files preferred** over large monolithic fixtures
- Easier to understand and maintain individual fixture files
- Clear naming conventions for fixture files
- Each test completely independent with its own fixture set

## Benefits

### Development Workflow
- **Fast Feedback**: Tests run in seconds without API delays
- **Reliable Results**: Deterministic outcomes for debugging
- **Realistic Data**: Actual AI responses ensure test validity
- **Easy Debugging**: Fixture files can be manually inspected

### Service Quality
- **Comprehensive Coverage**: Both happy path and error scenarios
- **Integration Confidence**: Real API interactions validated
- **Regression Protection**: Changes break tests if behavior changes
- **Documentation**: Fixtures serve as examples of expected behavior

### Maintenance
- **Independent Tests**: Each test fully isolated with own fixtures
- **Version Control**: Fixture changes tracked alongside code
- **Team Collaboration**: Shared understanding through visible fixtures
- **Debugging Support**: Failed tests show exact request/response mismatches

## CRITICAL: Test-Driven Development Philosophy

### Code Quality Over Test Convenience

**NEVER compromise production code quality for test convenience.** The following principles are non-negotiable:

#### When Tests Fail - Decision Framework

1. **Code Issue (Fix the Code)**:
   - Logic errors in service implementation
   - Incorrect handling of edge cases
   - Missing validation or error handling
   - Bugs in the business logic

2. **Test Issue (Fix the Test)**:
   - Incorrect test expectations
   - Outdated fixture data
   - Test setup problems
   - Mock configuration errors

3. **STOP and Analyze When Uncertain**:
   - Don't guess which is wrong
   - Don't make code changes to satisfy tests
   - Don't introduce code complexity for test convenience
   - Discuss with team/lead when unsure

#### Forbidden Test-Driven Changes

**NEVER modify production code to**:
- Add default values or fallback logic just to make tests pass
- Weaken type annotations or make them more permissive
- Add optional parameters when they shouldn't be optional
- Introduce defensive programming patterns that violate type safety
- Make code more complex to satisfy test mocking requirements
- Add try/catch blocks that hide real errors
- Relax validation rules or input constraints

#### Required Code Standards (from @docs/ai instructions.md)

Production code MUST maintain:
- **Strict typing**: No Any types, explicit annotations everywhere
- **No fallbacks**: Fail fast instead of guessing
- **No default values**: Be explicit about requirements
- **Trust the type system**: Don't add unnecessary null checks
- **Clean interfaces**: Services shouldn't care about testing infrastructure

#### Red Test Resolution Process

1. **Analyze the failure**: What specifically is failing and why?
2. **Identify root cause**: Is this a logic error, type error, or expectation mismatch?
3. **If code issue**: Fix the actual problem in the service
4. **If test issue**: Update test expectations or fixture data
5. **If uncertain**: STOP development, seek clarification
6. **Never**: Modify production code to accommodate test limitations

#### Examples of Correct vs Incorrect Approaches

**❌ WRONG - Weakening Code for Tests**:
```python
# DON'T do this to make mocking easier
def process_messages(self, messages: list[Message] | None = None) -> InterpreterResult:
    if messages is None:
        messages = []
    # ... rest of implementation
```

**✅ CORRECT - Fix Test Setup Instead**:
```python
# Keep code strict, fix test data
def process_messages(self, messages: list[Message]) -> InterpreterResult:
    # ... implementation assumes valid input
    
# In test: provide proper test data
def test_process_empty_messages():
    result = service.process_messages([])  # Explicit empty list
```

**❌ WRONG - Adding Defensive Code for Tests**:
```python
# DON'T add unnecessary checks
def load_schema(self) -> SchemaSystem:
    try:
        schema_data = self._load_json()
        if schema_data is None:  # Unnecessary if type system guarantees this
            return SchemaSystem.default()
    except Exception:
        return SchemaSystem.default()  # Hiding real errors
```

**✅ CORRECT - Let Real Errors Surface**:
```python
# Let type system and proper error handling work
def load_schema(self) -> SchemaSystem:
    schema_data = self._load_json()  # Will raise proper exception if fails
    return SchemaSystem(schema=Schema(schema_json=schema_data), ...)
```

This testing strategy ensures AI services are robust, reliable, and maintainable while providing confidence in both service logic and AI integration points **without compromising production code quality**.