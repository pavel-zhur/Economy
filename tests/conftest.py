"""Pytest configuration and shared fixtures."""

import pytest
from pathlib import Path

from tests.utils.openai_mock import OpenAIMock
from tests.utils.fixture_manager import FixtureManager
from tests.utils.test_config import test_config


@pytest.fixture
def openai_mock(request):
    """Provide OpenAI mock for tests."""
    # Extract service and test names from test location
    test_file = Path(request.fspath)
    service_name = test_file.stem.replace("test_", "").replace("_service", "")
    test_name = request.node.name
    
    return OpenAIMock(service_name, test_name)


@pytest.fixture
def fixture_manager(request):
    """Provide fixture manager for tests."""
    # Extract service and test names from test location
    test_file = Path(request.fspath)
    service_name = test_file.stem.replace("test_", "").replace("_service", "")
    test_name = request.node.name
    
    return FixtureManager(service_name, test_name)


@pytest.fixture
def temp_data_dir(tmp_path):
    """Provide temporary data directory for tests."""
    data_dir = tmp_path / "test_data"
    data_dir.mkdir()
    
    # Create minimal required files
    (data_dir / "messages.txt").write_text("Test message\\n")
    (data_dir / "current_schema.json").write_text('{"type": "object", "properties": {}}')
    (data_dir / "cookbook.md").write_text("# Test Cookbook\\n")
    (data_dir / "current_interpretations.json").write_text("[]")
    (data_dir / "architect_instructions.md").write_text("Test architect instructions")
    (data_dir / "interpreter_instructions.md").write_text("Test interpreter instructions")
    
    return data_dir


@pytest.fixture(autouse=True)
def setup_test_environment():
    """Set up test environment for each test."""
    # Ensure test configuration is loaded
    assert test_config is not None
    
    # Provide information about test mode
    print(f"\\n[TEST MODE] {test_config.get_mode_description()}")