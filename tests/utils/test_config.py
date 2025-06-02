"""Test configuration and mode management."""

import os
from enum import Enum
from pathlib import Path
from typing import Optional


class TestMode(Enum):
    """Three-mode testing system for cost-effective AI testing."""
    RECORD_ALL = "record_all"                    # Record AI calls + test outputs
    VERIFY_AI_RECORD_TESTS = "verify_ai_record_tests"  # Use AI fixtures, record test outputs  
    VERIFY_ALL = "verify_all"                    # Use AI fixtures + validate test outputs


class TestConfig:
    """Test configuration management."""
    
    def __init__(self) -> None:
        # Load test environment variables manually
        test_env_path = Path(__file__).parent.parent / ".env"
        self._load_env_file(test_env_path)
        
        # Configuration values - single three-way mode
        self.test_mode = TestMode(
            os.getenv("TEST_MODE", "verify_all")
        )
        
        # OpenAI configuration for tests
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "test-key-not-real")
        self.interpreter_model = os.getenv("TEST_INTERPRETER_MODEL", "gpt-4o-mini")
        self.architect_model = os.getenv("TEST_ARCHITECT_MODEL", "gpt-4o-mini")
        
        # Test directories
        self.tests_dir = Path(__file__).parent.parent
        self.fixtures_dir = self.tests_dir / "services" / "fixtures"
    
    def get_fixture_dir(self, service_name: str, test_name: str) -> Path:
        """Get fixture directory for specific test."""
        return self.fixtures_dir / service_name / test_name
    
    def should_record_openai(self) -> bool:
        """Check if should record real OpenAI calls."""
        return self.test_mode == TestMode.RECORD_ALL
    
    def should_record_fixtures(self) -> bool:
        """Check if should record/update fixture outputs."""
        return self.test_mode in [TestMode.RECORD_ALL, TestMode.VERIFY_AI_RECORD_TESTS]
    
    def should_validate_strictly(self) -> bool:
        """Check if should validate strictly against fixtures."""
        return self.test_mode == TestMode.VERIFY_ALL
    
    def get_mode_description(self) -> str:
        """Get human-readable description of current test mode."""
        descriptions = {
            TestMode.RECORD_ALL: "Recording OpenAI API calls and test outputs",
            TestMode.VERIFY_AI_RECORD_TESTS: "Using AI fixtures, recording test outputs", 
            TestMode.VERIFY_ALL: "Validating against all fixtures"
        }
        return descriptions[self.test_mode]
    
    def _load_env_file(self, env_path: Path) -> None:
        """Load environment variables from .env file."""
        if not env_path.exists():
            return
        
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()


# Global test configuration instance
test_config = TestConfig()