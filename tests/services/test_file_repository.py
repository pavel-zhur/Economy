"""Integration tests for FileRepository."""

import json
from pathlib import Path

from tests.utils.fixture_manager import FixtureManager

from economy_a5.services.file_repository import FileRepository
from economy_a5.models.core import (
    FileConfig,
    Message,
    Schema,
    Cookbook,
    SchemaSystem,
    Interpretation,
)


class TestFileRepository:
    """Integration tests for FileRepository file operations."""
    
    def test_load_save_messages(self, temp_data_dir: Path, fixture_manager: FixtureManager) -> None:
        """Test loading and saving messages."""
        # Arrange
        file_config = FileConfig(
            messages_file=temp_data_dir / "messages.txt",
            schema_file=temp_data_dir / "schema.json",
            cookbook_file=temp_data_dir / "cookbook.md",
            interpretations_file=temp_data_dir / "interpretations.json",
            architect_instructions_file=temp_data_dir / "architect_instructions.md",
            interpreter_instructions_file=temp_data_dir / "interpreter_instructions.md",
            migration_session_file=temp_data_dir / "migration_session.md",
        )
        
        messages = [
            Message(content="Coffee $4.50", message_id="MSG_0"),
            Message(content="Lunch $12.00", message_id="MSG_1"),
            Message(content="Gas $30.00", message_id="MSG_2"),
        ]
        
        # Write test messages to file
        messages_content = "\n".join(msg.content for msg in messages)
        file_config.messages_file.write_text(messages_content)
        
        repository = FileRepository(file_config)
        
        # Act
        loaded_messages = repository.load_messages()
        
        # Assert
        assert len(loaded_messages) == 3
        assert loaded_messages[0].content == "Coffee $4.50"
        assert loaded_messages[0].message_id == "0"
        assert loaded_messages[1].content == "Lunch $12.00" 
        assert loaded_messages[1].message_id == "1"
        assert loaded_messages[2].content == "Gas $30.00"
        assert loaded_messages[2].message_id == "2"
        
        # Save fixtures
        result_data = {
            "loaded_message_count": len(loaded_messages),
            "first_message_content": loaded_messages[0].content,
            "message_ids": [msg.message_id for msg in loaded_messages]
        }
        fixture_manager.validate_output("expected_output.json", result_data)
    
    def test_load_save_schema_system(self, temp_data_dir: Path, fixture_manager: FixtureManager) -> None:
        """Test loading and saving schema system."""
        # Arrange
        file_config = FileConfig(
            messages_file=temp_data_dir / "messages.txt",
            schema_file=temp_data_dir / "schema.json",
            cookbook_file=temp_data_dir / "cookbook.md",
            interpretations_file=temp_data_dir / "interpretations.json",
            architect_instructions_file=temp_data_dir / "architect_instructions.md",
            interpreter_instructions_file=temp_data_dir / "interpreter_instructions.md",
            migration_session_file=temp_data_dir / "migration_session.md",
        )
        
        schema_data = {
            "type": "object",
            "properties": {
                "amount": {"type": "number"},
                "category": {"type": "string"},
                "description": {"type": "string"}
            },
            "required": ["amount", "category"]
        }
        
        cookbook_content = """# Budget Tracker Cookbook

## Categories
- food: Restaurants, groceries, dining
- transport: Gas, public transit, rideshare
- entertainment: Movies, games, hobbies

## Guidelines  
- Extract numeric amounts without currency symbols
- Use descriptive categories
- Default to "miscellaneous" if category unclear"""
        
        # Write test data to files
        file_config.schema_file.write_text(json.dumps(schema_data, indent=2))
        file_config.cookbook_file.write_text(cookbook_content)
        
        repository = FileRepository(file_config)
        
        # Act
        schema_system = repository.load_schema_system()
        
        # Assert
        assert schema_system.schema.schema_json == schema_data
        assert schema_system.schema.version == "1.0"  # Default version
        assert schema_system.cookbook.content == cookbook_content
        assert schema_system.cookbook.version == "1.0"
        
        # Test saving
        new_schema_system = SchemaSystem(
            schema=Schema(
                schema_json={"type": "object", "properties": {"test": {"type": "string"}}},
                version="2.0"
            ),
            cookbook=Cookbook(content="# Updated cookbook", version="2.0")
        )
        
        repository.save_schema_system(new_schema_system)
        
        # Verify saved data
        saved_schema_data = json.loads(file_config.schema_file.read_text())
        saved_cookbook_content = file_config.cookbook_file.read_text()
        
        assert saved_schema_data == new_schema_system.schema.schema_json
        assert saved_cookbook_content == new_schema_system.cookbook.content
        
        # Save fixtures
        result_data = {
            "original_schema": schema_data,
            "original_cookbook_lines": len(cookbook_content.split("\\n")),
            "updated_schema": new_schema_system.schema.schema_json,
            "updated_cookbook": new_schema_system.cookbook.content
        }
        fixture_manager.validate_output("expected_output.json", result_data)
    
    def test_load_save_interpretations(self, temp_data_dir: Path, fixture_manager: FixtureManager) -> None:
        """Test loading and saving interpretations."""
        # Arrange
        file_config = FileConfig(
            messages_file=temp_data_dir / "messages.txt",
            schema_file=temp_data_dir / "schema.json",
            cookbook_file=temp_data_dir / "cookbook.md",
            interpretations_file=temp_data_dir / "interpretations.json",
            architect_instructions_file=temp_data_dir / "architect_instructions.md",
            interpreter_instructions_file=temp_data_dir / "interpreter_instructions.md",
            migration_session_file=temp_data_dir / "migration_session.md",
        )
        
        interpretations_data = [
            {
                "message_id": "MSG_0",
                "structured_data": {"amount": 4.50, "category": "food", "description": "Coffee"},
                "schema_version": "1.0"
            },
            {
                "message_id": "MSG_1", 
                "structured_data": {"amount": 12.00, "category": "food", "description": "Lunch"},
                "schema_version": "1.0"
            }
        ]
        
        # Write test data
        file_config.interpretations_file.write_text(json.dumps(interpretations_data, indent=2))
        
        repository = FileRepository(file_config)
        
        # Act
        interpretations = repository.load_interpretations()
        
        # Assert
        assert len(interpretations) == 2
        assert interpretations[0].message_id == "MSG_0"
        assert interpretations[0].structured_data["amount"] == 4.50
        assert interpretations[0].schema_version == "1.0"
        assert interpretations[1].message_id == "MSG_1"
        assert interpretations[1].structured_data["category"] == "food"
        
        # Test saving new interpretations
        new_interpretations = [
            Interpretation(
                message_id="MSG_2",
                structured_data={"amount": 25.00, "category": "transport", "description": "Gas"},
                schema_version="1.0"
            )
        ]
        
        repository.save_interpretations(new_interpretations)
        
        # Verify saved data
        saved_data = json.loads(file_config.interpretations_file.read_text())
        assert len(saved_data) == 1
        assert saved_data[0]["message_id"] == "MSG_2"
        assert saved_data[0]["structured_data"]["amount"] == 25.00
        
        # Save fixtures
        result_data = {
            "loaded_interpretations_count": len(interpretations),
            "first_interpretation": {
                "message_id": interpretations[0].message_id,
                "amount": interpretations[0].structured_data["amount"],
                "category": interpretations[0].structured_data["category"]
            },
            "saved_interpretation": {
                "message_id": new_interpretations[0].message_id,
                "amount": new_interpretations[0].structured_data["amount"]
            }
        }
        fixture_manager.validate_output("expected_output.json", result_data)
    
    def test_load_instructions(self, temp_data_dir: Path, fixture_manager: FixtureManager) -> None:
        """Test loading AI instruction files."""
        # Arrange
        file_config = FileConfig(
            messages_file=temp_data_dir / "messages.txt",
            schema_file=temp_data_dir / "schema.json",
            cookbook_file=temp_data_dir / "cookbook.md",
            interpretations_file=temp_data_dir / "interpretations.json",
            architect_instructions_file=temp_data_dir / "architect_instructions.md",
            interpreter_instructions_file=temp_data_dir / "interpreter_instructions.md",
            migration_session_file=temp_data_dir / "migration_session.md",
        )
        
        architect_instructions = """# Schema Architect Instructions

You are an AI that helps users evolve their data schemas through conversation.

## Your Role
- Understand current schema and data patterns
- Propose improvements while maintaining continuity
- Guide users through schema evolution process
- Provide clear explanations and examples

## Conversation Style
- Be helpful and collaborative
- Ask clarifying questions when needed
- Provide concrete examples
- Explain your reasoning"""

        interpreter_instructions = """# Interpreter Instructions

You interpret natural language messages into structured data.

## Your Role
- Parse messages according to provided schema
- Extract relevant information accurately
- Provide confidence feedback
- Flag potential issues or ambiguities

## Guidelines
- Be consistent in interpretation patterns
- Use provided cookbook for guidance
- When uncertain, note it in feedback
- Always attempt to parse even with low confidence"""
        
        # Write instruction files
        file_config.architect_instructions_file.write_text(architect_instructions)
        file_config.interpreter_instructions_file.write_text(interpreter_instructions)
        
        repository = FileRepository(file_config)
        
        # Act
        loaded_architect = repository.load_architect_instructions()
        loaded_interpreter = repository.load_interpreter_instructions()
        
        # Assert
        assert loaded_architect == architect_instructions
        assert loaded_interpreter == interpreter_instructions
        assert "Schema Architect Instructions" in loaded_architect
        assert "Interpreter Instructions" in loaded_interpreter
        
        # Save fixtures
        result_data = {
            "architect_instructions_length": len(loaded_architect),
            "interpreter_instructions_length": len(loaded_interpreter),
            "architect_contains_role": "Your Role" in loaded_architect,
            "interpreter_contains_guidelines": "Guidelines" in loaded_interpreter
        }
        fixture_manager.validate_output("expected_output.json", result_data)
    
    def test_empty_files_handling(self, temp_data_dir: Path, fixture_manager: FixtureManager) -> None:
        """Test handling of empty or missing files."""
        # Arrange
        file_config = FileConfig(
            messages_file=temp_data_dir / "empty_messages.txt",
            schema_file=temp_data_dir / "empty_schema.json",
            cookbook_file=temp_data_dir / "empty_cookbook.md",
            interpretations_file=temp_data_dir / "empty_interpretations.json",
            architect_instructions_file=temp_data_dir / "empty_architect.md",
            interpreter_instructions_file=temp_data_dir / "empty_interpreter.md",
            migration_session_file=temp_data_dir / "empty_session.md",
        )
        
        # Create empty files
        file_config.messages_file.write_text("")
        file_config.schema_file.write_text("{}")
        file_config.cookbook_file.write_text("")
        file_config.interpretations_file.write_text("[]")
        
        repository = FileRepository(file_config)
        
        # Act & Assert
        messages = repository.load_messages()
        assert len(messages) == 0
        
        interpretations = repository.load_interpretations()
        assert len(interpretations) == 0
        
        schema_system = repository.load_schema_system()
        assert schema_system.schema.schema_json == {}
        assert schema_system.cookbook.content == ""
        
        # Save fixtures
        result_data = {
            "empty_messages_count": len(messages),
            "empty_interpretations_count": len(interpretations),
            "empty_schema": schema_system.schema.schema_json,
            "empty_cookbook": schema_system.cookbook.content
        }
        fixture_manager.validate_output("expected_output.json", result_data)