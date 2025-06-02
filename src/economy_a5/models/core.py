"""Core data models for the POC system."""

from dataclasses import dataclass
from typing import Any
from pathlib import Path


@dataclass(frozen=True)
class Message:
    """Raw input message from user."""
    
    content: str
    message_id: str


@dataclass(frozen=True)
class Schema:
    """JSON Schema definition for structured data."""
    
    schema_json: dict[str, Any]
    version: str


@dataclass(frozen=True)
class Cookbook:
    """Interpretation guide and hints in markdown format."""
    
    content: str
    version: str


@dataclass(frozen=True)
class SchemaSystem:
    """Complete schema system including JSON schema and cookbook."""
    
    schema: Schema
    cookbook: Cookbook


@dataclass(frozen=True)
class Interpretation:
    """Structured data interpretation of a message."""
    
    message_id: str
    structured_data: dict[str, Any]
    schema_version: str


@dataclass(frozen=True)
class Feedback:
    """Feedback from interpreter about parsing confidence and issues."""
    
    message_id: str
    confidence_level: str  # "high", "medium", "low"
    warnings: list[str]
    overall_notes: str


@dataclass(frozen=True)
class InterpreterResult:
    """Result from interpreter containing interpretations and feedback."""
    
    interpretations: list[Interpretation]
    feedback: list[Feedback]
    overall_feedback: str


@dataclass(frozen=True)
class FileConfig:
    """Configuration for file paths used by the POC."""
    
    messages_file: Path
    schema_file: Path
    cookbook_file: Path
    interpretations_file: Path
    architect_instructions_file: Path
    interpreter_instructions_file: Path
    migration_session_file: Path
    
    def ensure_directories(self) -> None:
        """Ensure all parent directories exist."""
        for file_path in [
            self.messages_file,
            self.schema_file,
            self.cookbook_file,
            self.interpretations_file,
            self.architect_instructions_file,
            self.interpreter_instructions_file,
            self.migration_session_file,
        ]:
            file_path.parent.mkdir(parents=True, exist_ok=True)