"""Application configuration settings."""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass(frozen=True)
class OpenAIConfig:
    """OpenAI API configuration."""
    
    api_key: str
    model: str = "gpt-4o-mini"
    temperature: float = 0.1
    max_tokens: int = 4000


@dataclass(frozen=True)
class AppConfig:
    """Main application configuration."""
    
    openai_api_key: str
    interpreter_model: str
    architect_model: str
    data_directory: Path
    
    @classmethod
    def create_default(
        cls, 
        openai_api_key: str, 
        interpreter_model: str = "gpt-4o-mini",
        architect_model: str = "gpt-4o-mini",
        data_dir: Optional[Path] = None,
    ) -> "AppConfig":
        """Create default configuration."""
        if data_dir is None:
            data_dir = Path("./data")
            
        return cls(
            openai_api_key=openai_api_key,
            interpreter_model=interpreter_model,
            architect_model=architect_model,
            data_directory=data_dir,
        )
    
    def get_interpreter_openai_config(self) -> OpenAIConfig:
        """Get OpenAI config for interpreter."""
        return OpenAIConfig(api_key=self.openai_api_key, model=self.interpreter_model)
    
    def get_architect_openai_config(self) -> OpenAIConfig:
        """Get OpenAI config for architect."""
        return OpenAIConfig(api_key=self.openai_api_key, model=self.architect_model)