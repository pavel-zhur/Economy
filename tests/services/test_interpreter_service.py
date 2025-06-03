"""Integration tests for InterpreterService."""

from tests.utils.fixture_manager import FixtureManager
from tests.utils.openai_mock import OpenAIMock

from economy_a5.services.interpreter import InterpreterService
from economy_a5.models.core import (
    Message,
    Schema,
    Cookbook,
    SchemaSystem,
    Interpretation,
)


class TestInterpreterService:
    """Integration tests for InterpreterService."""
    
    def test_feed_mode_basic_expenses(self, openai_mock: OpenAIMock, fixture_manager: FixtureManager) -> None:
        """Test feed mode processing with basic expense messages."""
        # Arrange - Set up test data
        messages = [
            Message(content="Bought coffee at Starbucks for $4.50", message_id="MSG_0"),
            Message(content="Paid rent $1200 for January", message_id="MSG_1"),
            Message(content="Grocery shopping at Safeway, spent $67.89", message_id="MSG_2"),
        ]
        
        schema_data = {
            "type": "object",
            "properties": {
                "transaction_type": {"type": "string", "enum": ["expense", "income", "transfer"]},
                "amount": {"type": "number"},
                "category": {"type": "string"},
                "merchant": {"type": "string"},
                "account": {"type": "string"},
                "description": {"type": "string"},
                "date": {"type": "string"}
            },
            "required": ["transaction_type", "amount", "category", "description"]
        }
        
        cookbook_content = """# Budget Tracker Cookbook

## Transaction Types
- expense: Money spent
- income: Money received
- transfer: Moving money between accounts

## Categories
- food_dining: Restaurants, coffee, takeout
- housing: Rent, mortgage, utilities
- groceries: Food shopping
- transportation: Gas, public transport, rideshare
- shopping: General purchases

## Guidelines
- Extract amount as number without currency symbols
- Infer date if not specified (use current date)
- Use descriptive but concise descriptions
- Default account to "checking" if not specified"""
        
        schema_system = SchemaSystem(
            schema=Schema(schema_json=schema_data, version="1.0"),
            cookbook=Cookbook(content=cookbook_content, version="1.0")
        )
        
        instructions = """You are an AI that interprets natural language messages into structured financial data.
Parse each message according to the provided schema and cookbook.
Be consistent and accurate in your interpretations."""
        
        # Create service and replace client with OpenAI mock
        service = InterpreterService(openai_mock.config, instructions)
        service._client = openai_mock
        
        # Act
        result = service.process_feed_mode(messages, schema_system)
        
        # Assert - Basic validation
        assert len(result.interpretations) == len(messages)
        assert len(result.feedback) == len(messages)
        assert result.overall_feedback is not None
        
        # Validate interpretation structure
        for interpretation in result.interpretations:
            assert interpretation.schema_version == "1.0"
            assert interpretation.message_id in ["MSG_0", "MSG_1", "MSG_2"]
            assert "transaction_type" in interpretation.structured_data
            assert "amount" in interpretation.structured_data
            
        # Validate feedback structure
        for feedback in result.feedback:
            assert feedback.message_id in ["MSG_0", "MSG_1", "MSG_2"]
            assert feedback.confidence_level in ["high", "medium", "low"]
            assert isinstance(feedback.warnings, list)
            
        # Convert result to dict for fixture validation
        result_data = {
            "interpretations": [
                {
                    "message_id": interp.message_id,
                    "structured_data": interp.structured_data,
                    "schema_version": interp.schema_version
                }
                for interp in result.interpretations
            ],
            "feedback": [
                {
                    "message_id": fb.message_id,
                    "confidence_level": fb.confidence_level,
                    "warnings": fb.warnings,
                    "overall_notes": fb.overall_notes
                }
                for fb in result.feedback
            ],
            "overall_feedback": result.overall_feedback
        }
        
        fixture_manager.validate_output("expected_output.json", result_data)
    
    def test_feed_mode_empty_messages(self, openai_mock: OpenAIMock, fixture_manager: FixtureManager) -> None:
        """Test feed mode with empty message list."""
        # Arrange
        messages = []
        schema_system = SchemaSystem(
            schema=Schema(schema_json={"type": "object"}, version="1.0"),
            cookbook=Cookbook(content="# Empty cookbook", version="1.0")
        )
        instructions = "Test instructions"
        
        service = InterpreterService(openai_mock.config, instructions)
        service._client = openai_mock
        
        # Act
        result = service.process_feed_mode(messages, schema_system)
        
        # Assert
        assert len(result.interpretations) == 0
        assert len(result.feedback) == 0
        assert result.overall_feedback is not None
        
        # Save fixtures
        result_data = {
            "interpretations": [],
            "feedback": [],
            "overall_feedback": result.overall_feedback
        }
        fixture_manager.validate_output("expected_output.json", result_data)
    
    def test_reprocessing_mode_schema_migration(self, openai_mock: OpenAIMock, fixture_manager: FixtureManager) -> None:
        """Test reprocessing mode with schema migration."""
        # Arrange - Original data
        messages = [
            Message(content="Coffee $4.50", message_id="MSG_0"),
            Message(content="Lunch $12.00", message_id="MSG_1"),
        ]
        
        old_schema_system = SchemaSystem(
            schema=Schema(
                schema_json={
                    "type": "object",
                    "properties": {
                        "amount": {"type": "number"},
                        "category": {"type": "string"}
                    }
                },
                version="1.0"
            ),
            cookbook=Cookbook(content="# Old cookbook - simple categories", version="1.0")
        )
        
        old_interpretations = [
            Interpretation(
                message_id="MSG_0",
                structured_data={"amount": 4.50, "category": "food"},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_1", 
                structured_data={"amount": 12.00, "category": "food"},
                schema_version="1.0"
            ),
        ]
        
        # New schema with more detailed structure
        new_schema_system = SchemaSystem(
            schema=Schema(
                schema_json={
                    "type": "object",
                    "properties": {
                        "transaction_type": {"type": "string"},
                        "amount": {"type": "number"},
                        "category": {"type": "string"},
                        "subcategory": {"type": "string"},
                        "merchant": {"type": "string"},
                        "description": {"type": "string"}
                    }
                },
                version="2.0"
            ),
            cookbook=Cookbook(content="# New cookbook - detailed categorization with subcategories", version="2.0")
        )
        
        instructions = """You are reprocessing messages with a new schema.
Maintain continuity with previous interpretations while adapting to new structure."""
        
        service = InterpreterService(openai_mock.config, instructions)
        service._client = openai_mock
        
        # Act
        result = service.process_reprocessing_mode(
            messages, new_schema_system, old_schema_system, old_interpretations
        )
        
        # Assert
        assert len(result.interpretations) == len(messages)
        assert len(result.feedback) == len(messages)
        
        # Validate new schema version
        for interpretation in result.interpretations:
            assert interpretation.schema_version == "2.0"
            assert "amount" in interpretation.structured_data  # Continuity
            
        result_data = {
            "interpretations": [
                {
                    "message_id": interp.message_id,
                    "structured_data": interp.structured_data,
                    "schema_version": interp.schema_version
                }
                for interp in result.interpretations
            ],
            "feedback": [
                {
                    "message_id": fb.message_id,
                    "confidence_level": fb.confidence_level,
                    "warnings": fb.warnings,
                    "overall_notes": fb.overall_notes
                }
                for fb in result.feedback
            ],
            "overall_feedback": result.overall_feedback
        }
        
        fixture_manager.validate_output("expected_output.json", result_data)
    
    def test_invalid_json_response_handling(self, openai_mock: OpenAIMock, fixture_manager: FixtureManager) -> None:
        """Test handling of invalid JSON response from AI."""
        # Arrange
        messages = [Message(content="Test message", message_id="MSG_0")]
        schema_system = SchemaSystem(
            schema=Schema(schema_json={"type": "object"}, version="1.0"),
            cookbook=Cookbook(content="# Test", version="1.0")
        )
        instructions = "Test instructions"
        
        # Mock the AI to return invalid JSON
        invalid_response = "This is not valid JSON at all!"
        
        # Mock the _call_openai method to return invalid JSON
        service = InterpreterService(openai_mock.config, instructions)
        service._call_openai = lambda prompt: invalid_response
        
        # Act
        result = service.process_feed_mode(messages, schema_system)
        
        # Assert - Should handle gracefully
        assert len(result.interpretations) == 0  # No valid interpretations
        assert len(result.feedback) == 1  # Error feedback for the message
        assert "Failed to parse AI response" in result.feedback[0].warnings[0]
        assert result.feedback[0].confidence_level == "low"
        assert "Failed to parse interpreter response" in result.overall_feedback
        
        # Save fixtures
        result_data = {
            "interpretations": [],
            "feedback": [
                {
                    "message_id": fb.message_id,
                    "confidence_level": fb.confidence_level,
                    "warnings": fb.warnings,
                    "overall_notes": fb.overall_notes
                }
                for fb in result.feedback
            ],
            "overall_feedback": result.overall_feedback
        }
        fixture_manager.validate_output("expected_output.json", result_data)
    
    def test_feed_mode_single_message(self, openai_mock: OpenAIMock, fixture_manager: FixtureManager) -> None:
        """Test feed mode with single message - boundary condition."""
        # Arrange
        messages = [Message(content="Quick coffee $3", message_id="MSG_0")]
        schema_system = SchemaSystem(
            schema=Schema(
                schema_json={
                    "type": "object",
                    "properties": {"amount": {"type": "number"}, "item": {"type": "string"}}
                },
                version="1.0"
            ),
            cookbook=Cookbook(content="# Simple tracking", version="1.0")
        )
        instructions = "Parse single messages"
        
        service = InterpreterService(openai_mock.config, instructions)
        service._client = openai_mock
        
        # Act
        result = service.process_feed_mode(messages, schema_system)
        
        # Assert
        assert len(result.interpretations) == 1
        assert len(result.feedback) == 1
        assert result.interpretations[0].message_id == "MSG_0"
        assert result.feedback[0].message_id == "MSG_0"
        
        result_data = {
            "interpretations": [
                {
                    "message_id": interp.message_id,
                    "structured_data": interp.structured_data,
                    "schema_version": interp.schema_version
                }
                for interp in result.interpretations
            ],
            "feedback": [
                {
                    "message_id": fb.message_id,
                    "confidence_level": fb.confidence_level,
                    "warnings": fb.warnings,
                    "overall_notes": fb.overall_notes
                }
                for fb in result.feedback
            ],
            "overall_feedback": result.overall_feedback
        }
        
        fixture_manager.validate_output("expected_output.json", result_data)