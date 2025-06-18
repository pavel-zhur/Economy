"""Configuration module for POC 4 AI-managed database"""

import os
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    database_url: str = Field(
        default="postgresql://poc4_user:poc4_password@localhost:5432/poc4_db",
        env="DATABASE_URL",
        description="PostgreSQL database connection URL"
    )
    
    # Chainlit Database (separate from main database)
    chainlit_database_url: str = Field(
        default="postgresql+asyncpg://poc4_user:poc4_password@localhost:5432/chainlit",
        env="CHAINLIT_DATABASE_URL",
        description="PostgreSQL database connection URL for Chainlit chat persistence"
    )
    
    # LLM API Keys
    openai_api_key: Optional[str] = Field(
        default=None,
        env="OPENAI_API_KEY",
        description="OpenAI API key for GPT models"
    )
    
    anthropic_api_key: Optional[str] = Field(
        default=None,
        env="ANTHROPIC_API_KEY", 
        description="Anthropic API key for Claude models"
    )
    
    # LangFuse Tracing
    langfuse_public_key: Optional[str] = Field(
        default=None,
        env="LANGFUSE_PUBLIC_KEY",
        description="LangFuse public key for tracing"
    )
    
    langfuse_secret_key: Optional[str] = Field(
        default=None,
        env="LANGFUSE_SECRET_KEY",
        description="LangFuse secret key for tracing"
    )
    
    langfuse_host: str = Field(
        default="http://localhost:3000",
        env="LANGFUSE_HOST",
        description="LangFuse host URL"
    )
    
    # AI Agent Configuration
    llm_model: str = Field(
        default="gpt-4o-mini",
        env="LLM_MODEL",
        description="LLM model to use"
    )
    
    llm_temperature: float = Field(
        default=0.1,
        env="LLM_TEMPERATURE",
        description="LLM temperature for randomness"
    )
    
    max_iterations: int = Field(
        default=10,
        env="MAX_ITERATIONS",
        description="Maximum iterations for SQL agent"
    )
    
    log_level: str = Field(
        default="INFO",
        env="LOG_LEVEL",
        description="Logging level"
    )
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()

def get_settings() -> Settings:
    """Get application settings"""
    return settings 