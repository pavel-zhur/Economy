"""Test fixture management and validation."""

import json
from pathlib import Path
from typing import Any, List

from economy_a5.models.core import (
    Message,
    Schema,
    Cookbook,
    SchemaSystem,
    Interpretation,
)
from tests.utils.test_config import test_config


class FixtureManager:
    """Manages test fixture files and validation."""
    
    def __init__(self, service_name: str, test_name: str) -> None:
        self.service_name = service_name
        self.test_name = test_name
        self.fixture_dir = test_config.get_fixture_dir(service_name, test_name)
        
        # Ensure fixture directory exists if recording
        if test_config.should_record_fixtures() or test_config.should_record_openai():
            self.fixture_dir.mkdir(parents=True, exist_ok=True)
    
    def load_text(self, filename: str) -> str:
        """Load text content from fixture file."""
        file_path = self.fixture_dir / filename
        if not file_path.exists():
            if test_config.should_record_fixtures():
                return ""  # Return empty for recording mode
            raise FileNotFoundError(f"Fixture file not found: {file_path}")
        
        return file_path.read_text(encoding="utf-8")
    
    def save_text(self, filename: str, content: str) -> None:
        """Save text content to fixture file."""
        if not test_config.should_record_fixtures():
            return  # Skip saving in readonly mode
        
        file_path = self.fixture_dir / filename
        file_path.write_text(content, encoding="utf-8")
    
    def load_json(self, filename: str) -> Any:
        """Load JSON data from fixture file."""
        content = self.load_text(filename)
        if not content:
            return {} if test_config.should_record_fixtures() else None
        
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in fixture {filename}: {e}")
    
    def save_json(self, filename: str, data: Any) -> None:
        """Save JSON data to fixture file."""
        if not test_config.should_record_fixtures():
            return  # Skip saving in readonly mode
        
        content = json.dumps(data, indent=2, ensure_ascii=False)
        self.save_text(filename, content)
    
    def load_messages(self) -> List[Message]:
        """Load messages from input_messages.txt fixture."""
        content = self.load_text("input_messages.txt")
        if not content.strip():
            return []
        
        messages = []
        for i, line in enumerate(content.strip().split("\n")):
            if line.strip():
                messages.append(Message(
                    content=line.strip(),
                    message_id=f"MSG_{i}"
                ))
        
        return messages
    
    def save_messages(self, messages: List[Message]) -> None:
        """Save messages to input_messages.txt fixture."""
        content = "\n".join(msg.content for msg in messages)
        self.save_text("input_messages.txt", content)
    
    def load_schema_system(self) -> SchemaSystem:
        """Load schema system from fixtures."""
        schema_data = self.load_json("schema.json")
        cookbook_content = self.load_text("cookbook.md")
        
        if not schema_data and test_config.should_validate_strictly():
            raise ValueError("Schema fixture not found and not in recording mode")
        
        schema = Schema(
            schema_json=schema_data or {},
            version="1.0"
        )
        cookbook = Cookbook(
            content=cookbook_content or "# Test Cookbook\\n\\nTest interpretation guide.",
            version="1.0"
        )
        
        return SchemaSystem(schema=schema, cookbook=cookbook)
    
    def save_schema_system(self, schema_system: SchemaSystem) -> None:
        """Save schema system to fixtures."""
        self.save_json("schema.json", schema_system.schema.schema_json)
        self.save_text("cookbook.md", schema_system.cookbook.content)
    
    def load_interpretations(self) -> List[Interpretation]:
        """Load interpretations from fixture."""
        data = self.load_json("interpretations.json")
        if not data:
            return []
        
        interpretations = []
        for item in data:
            interpretations.append(Interpretation(
                message_id=item["message_id"],
                structured_data=item["structured_data"],
                schema_version=item["schema_version"]
            ))
        
        return interpretations
    
    def save_interpretations(self, interpretations: List[Interpretation]) -> None:
        """Save interpretations to fixture."""
        data = []
        for interp in interpretations:
            data.append({
                "message_id": interp.message_id,
                "structured_data": interp.structured_data,
                "schema_version": interp.schema_version
            })
        
        self.save_json("interpretations.json", data)
    
    def validate_output(self, filename: str, actual_data: Any) -> None:
        """Validate actual output against expected fixture."""
        if test_config.should_record_fixtures():
            # Record mode - save actual data as expected
            self.save_json(filename, actual_data)
            return
        
        # Verify mode - compare against saved fixture
        expected_data = self.load_json(filename)
        if expected_data is None:
            raise AssertionError(f"Expected output fixture {filename} not found")
        
        if actual_data != expected_data:
            # Provide detailed error message
            raise AssertionError(
                f"Output mismatch in {filename}:\\n"
                f"Expected: {json.dumps(expected_data, indent=2)}\\n"
                f"Actual: {json.dumps(actual_data, indent=2)}"
            )
    
    def load_instructions(self) -> str:
        """Load AI instructions from fixture."""
        return self.load_text("instructions.md")
    
    def save_instructions(self, instructions: str) -> None:
        """Save AI instructions to fixture."""
        self.save_text("instructions.md", instructions)