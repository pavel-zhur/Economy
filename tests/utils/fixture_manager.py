"""Test fixture management and validation."""

import json
from typing import Any

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
        content = file_path.read_text(encoding="utf-8")
        if not content:
            raise ValueError(f"Empty fixture file: {file_path}")
        
        return content
    
    def _save_text(self, filename: str, content: str) -> None:
        """Save text content to fixture file."""
        file_path = self.fixture_dir / filename
        file_path.write_text(content, encoding="utf-8")
    
    def load_json(self, filename: str) -> Any:
        """Load JSON data from fixture file."""
        content = self.load_text(filename)
        
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in fixture {filename}: {e}")
    
    def save_json(self, filename: str, data: Any) -> None:
        """Save JSON data to fixture file."""
        content = json.dumps(data, indent=2, ensure_ascii=False)
        self._save_text(filename, content)
    
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