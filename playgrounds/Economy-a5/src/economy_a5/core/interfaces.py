"""Core interfaces for the POC system."""

from abc import ABC, abstractmethod
from typing import Protocol

from ..models.core import (
    Message,
    SchemaSystem,
    Interpretation,
    InterpreterResult,
)


class InterpreterProtocol(Protocol):
    """Protocol for the interpreter service."""
    
    def process_feed_mode(
        self, 
        messages: list[Message], 
        schema_system: SchemaSystem,
    ) -> InterpreterResult:
        """Process new messages in feed mode."""
        ...
    
    def process_reprocessing_mode(
        self,
        messages: list[Message],
        new_schema_system: SchemaSystem,
        old_schema_system: SchemaSystem,
        old_interpretations: list[Interpretation],
    ) -> InterpreterResult:
        """Reprocess messages with new schema for migration preview."""
        ...


class SchemaArchitectProtocol(Protocol):
    """Protocol for the schema architect service."""
    
    def start_migration_session(
        self,
        current_schema_system: SchemaSystem,
        sample_messages: list[Message],
        current_interpretations: list[Interpretation],
    ) -> str:
        """Start a migration session and return initial response."""
        ...
    
    def continue_conversation(self, user_input: str) -> str:
        """Continue the migration conversation."""
        ...
    
    def get_proposed_schema_system(self) -> SchemaSystem | None:
        """Get the currently proposed schema system, if any."""
        ...
    
    def reset_session(self) -> None:
        """Reset the current migration session."""
        ...


class FileRepositoryProtocol(Protocol):
    """Protocol for file-based data persistence."""
    
    def load_messages(self) -> list[Message]:
        """Load messages from file."""
        ...
    
    def save_messages(self, messages: list[Message]) -> None:
        """Save messages to file."""
        ...
    
    def load_schema_system(self) -> SchemaSystem:
        """Load current schema system."""
        ...
    
    def save_schema_system(self, schema_system: SchemaSystem) -> None:
        """Save schema system."""
        ...
    
    def load_interpretations(self) -> list[Interpretation]:
        """Load current interpretations."""
        ...
    
    def save_interpretations(self, interpretations: list[Interpretation]) -> None:
        """Save interpretations."""
        ...
    
    def load_architect_instructions(self) -> str:
        """Load schema architect instructions."""
        ...
    
    def load_interpreter_instructions(self) -> str:
        """Load interpreter instructions."""
        ...
    
    def save_migration_session(self, session_log: str) -> None:
        """Save migration session conversation log."""
        ...