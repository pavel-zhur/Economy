# Testing Instructions for External Service Integration

Guidelines for testing Python services that integrate with external APIs.

## Testing Philosophy
- Use real external service responses as test fixtures
- Test integration points, not just internal logic
- Minimize external service calls during development
- Trust type system - don't test implementation details

## Testing Modes

### Two-Mode System (Simple External Services)
- **RECORD**: Capture real external responses to fixtures
- **VERIFY**: Use fixtures for fast, deterministic testing

### Three-Mode System (Complex/Expensive External Services)
- **RECORD_ALL**: Capture external responses + test outputs
- **VERIFY_EXTERNAL_RECORD_TESTS**: Use external fixtures, record test outputs
- **VERIFY_ALL**: Use all fixtures, no external calls

## Implementation

### External Service Mock
```python
class ExternalServiceMock:
    def __init__(self, test_name: str, mode: TestMode)
    def service_call(self, **kwargs) -> Response
    def _record_interaction(self, request: dict, response: dict)
    def _replay_interaction(self, request: dict) -> dict
```

### Fixture Structure
```
test_name/
├── input_data.json
├── external_request.json      # First call
├── external_response.json
├── external_request_2.json    # Multi-call support
├── external_response_2.json
└── expected_output.json
```

### Test Configuration
```bash
# Environment variable
TEST_MODE=verify_all  # record_all, verify_external_record_tests, verify_all
```

## Test Implementation

### Service Test Pattern
```python
def test_service_integration(self, fixture_manager, external_mock):
    # Arrange
    input_data = fixture_manager.load("input_data.json")
    service = Service(external_mock.config)
    
    # Act
    result = service.process(input_data)
    
    # Assert
    fixture_manager.validate_output("expected_output.json", result)
    assert result.status == "success"
```

### Multi-Call Testing
```python
def test_stateful_conversation():
    response1 = service.start_session(data1)
    response2 = service.continue_session(data2)
    response3 = service.finalize_session()
    
    # Test semantic progression, not just structure
    assert response2.references_previous_context
    assert response3.incorporates_full_session
```

## Quality Standards

### Semantic vs Structural Testing

**✅ GOOD - Semantic Validation**:
```python
def test_data_accuracy():
    result = service.process_external_data(fixture_data)
    assert result.extracted_amount == expected_amount
    assert result.category in valid_categories
```

**❌ AVOID - Surface Testing**:
```python
def test_structure_only():
    result = service.process(data)
    assert isinstance(result, ProcessingResult)
    assert hasattr(result, 'status')
```

### Integration Over Mocking
- Use real external service fixtures, not mocked responses
- Test actual service logic with captured external data
- Mock only at external service boundary, not internal methods

### Error Testing
```python
def test_malformed_response():
    # Use real malformed response from external service
    malformed_data = fixture_manager.load("malformed_response.json")
    result = service.process(malformed_data)
    assert result.status == "error"
    assert "malformed" in result.error_message
```

## High-Value Tests
- External service integration accuracy
- Multi-call state preservation
- Real error scenario handling
- End-to-end workflow correctness

## Low-Value Tests
- Internal state inspection
- Mocked error injection
- Implementation detail validation
- Structural checks without semantic meaning

## Workflow

1. **Record Mode**: Set `TEST_MODE=record_all`, run tests to capture fixtures
2. **Manual Review**: Inspect all generated fixtures for quality
3. **Verify Mode**: Set `TEST_MODE=verify_all`, run tests against fixtures
4. **CI/CD**: Always use verify mode, commit fixtures to repository

## Code Quality Rules

**NEVER modify production code for test convenience**:
- No default values just to make tests pass
- No optional parameters that shouldn't be optional
- No try/catch blocks that hide real errors
- No defensive programming when types guarantee correctness

**Fix root causes, not symptoms**:
- When tests fail, analyze whether code or test is wrong
- Don't weaken type annotations for easier mocking
- Don't add fallback logic to satisfy test scenarios
- Trust the type system and let real errors propagate