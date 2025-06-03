"""File-based repository implementation."""

import json
from pathlib import Path
from typing import Any

from ..core.interfaces import FileRepositoryProtocol
from ..models.core import (
    Message,
    Schema,
    Cookbook,
    SchemaSystem,
    Interpretation,
    FileConfig,
)


class FileRepository:
    """File-based repository for POC data persistence."""
    
    def __init__(self, config: FileConfig) -> None:
        self._config = config
        self._config.ensure_directories()
    
    def load_messages(self) -> list[Message]:
        """Load messages from file."""
        if not self._config.messages_file.exists():
            return []
        
        messages: list[Message] = []
        with self._config.messages_file.open("r", encoding="utf-8") as f:
            for i, line in enumerate(f):
                line = line.strip()
                if line:
                    messages.append(Message(content=line, message_id=str(i)))
        
        return messages
    
    def save_messages(self, messages: list[Message]) -> None:
        """Save messages to file."""
        with self._config.messages_file.open("w", encoding="utf-8") as f:
            for message in messages:
                f.write(f"{message.content}\n")
    
    def load_schema_system(self) -> SchemaSystem:
        """Load current schema system."""
        schema_json = self._load_json_file(self._config.schema_file)
        cookbook_content = self._load_text_file(self._config.cookbook_file)
        
        schema = Schema(schema_json=schema_json, version="1.0")
        cookbook = Cookbook(content=cookbook_content, version="1.0")
        
        return SchemaSystem(schema=schema, cookbook=cookbook)
    
    def save_schema_system(self, schema_system: SchemaSystem) -> None:
        """Save schema system."""
        self._save_json_file(self._config.schema_file, schema_system.schema.schema_json)
        self._save_text_file(self._config.cookbook_file, schema_system.cookbook.content)
    
    def load_interpretations(self) -> list[Interpretation]:
        """Load current interpretations."""
        if not self._config.interpretations_file.exists():
            return []
        
        data = self._load_json_file(self._config.interpretations_file)
        if not isinstance(data, list):
            return []
        
        interpretations: list[Interpretation] = []
        for item in data:
            if isinstance(item, dict) and all(key in item for key in ["message_id", "structured_data", "schema_version"]):
                interpretations.append(Interpretation(
                    message_id=item["message_id"],
                    structured_data=item["structured_data"],
                    schema_version=item["schema_version"],
                ))
        
        return interpretations
    
    def save_interpretations(self, interpretations: list[Interpretation]) -> None:
        """Save interpretations."""
        data = [
            {
                "message_id": interp.message_id,
                "structured_data": interp.structured_data,
                "schema_version": interp.schema_version,
            }
            for interp in interpretations
        ]
        self._save_json_file(self._config.interpretations_file, data)
    
    def load_architect_instructions(self) -> str:
        """Load schema architect instructions."""
        return self._load_text_file(self._config.architect_instructions_file)
    
    def load_interpreter_instructions(self) -> str:
        """Load interpreter instructions."""
        return self._load_text_file(self._config.interpreter_instructions_file)
    
    def save_migration_session(self, session_log: str) -> None:
        """Save migration session conversation log."""
        self._save_text_file(self._config.migration_session_file, session_log)
    
    def save_versioned_schema_system(self, schema_system: SchemaSystem) -> None:
        """Save versioned schema and cookbook files."""
        version = schema_system.schema.version
        
        # Save versioned schema file
        schema_file = self._config.schema_file.parent / f"schema_v{version}.json"
        self._save_json_file(schema_file, schema_system.schema.schema_json)
        
        # Save versioned cookbook file
        cookbook_file = self._config.cookbook_file.parent / f"cookbook_v{version}.md"
        self._save_text_file(cookbook_file, schema_system.cookbook.content)
    
    def save_versioned_interpretations(self, interpretations: list[Interpretation], version: str, prefix: str = "") -> None:
        """Save versioned interpretations file."""
        filename = f"interpretations{prefix}_v{version}.json" if prefix else f"interpretations_v{version}.json"
        interpretations_file = self._config.interpretations_file.parent / filename
        
        data = [
            {
                "message_id": interp.message_id,
                "structured_data": interp.structured_data,
                "schema_version": interp.schema_version,
            }
            for interp in interpretations
        ]
        self._save_json_file(interpretations_file, data)
    
    def _load_json_file(self, file_path: Path) -> Any:
        """Load JSON data from file."""
        if not file_path.exists():
            return {}
        
        with file_path.open("r", encoding="utf-8") as f:
            return json.load(f)
    
    def _save_json_file(self, file_path: Path, data: Any) -> None:
        """Save JSON data to file."""
        with file_path.open("w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def _load_text_file(self, file_path: Path) -> str:
        """Load text content from file."""
        if not file_path.exists():
            return ""
        
        with file_path.open("r", encoding="utf-8") as f:
            return f.read()
    
    def _save_text_file(self, file_path: Path, content: str) -> None:
        """Save text content to file."""
        with file_path.open("w", encoding="utf-8") as f:
            f.write(content)