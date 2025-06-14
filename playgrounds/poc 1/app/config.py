from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Database settings
    database_url: str = "postgresql://admin:admin123@localhost:5432/financial_planning"
    
    # Redis settings
    redis_url: str = "redis://localhost:6379"
    
    # MinIO settings
    minio_url: str = "http://localhost:9000"
    minio_access_key: str = "admin"
    minio_secret_key: str = "admin123"
    minio_bucket_name: str = "financial-data"
    
    # LangFuse settings
    langfuse_host: str = "http://localhost:3000"
    langfuse_public_key: str = "pk-lf-1234567890abcdef"
    langfuse_secret_key: str = "sk-lf-1234567890abcdef"
    
    # OpenAI settings
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4-turbo-preview"
    
    # Application settings
    app_name: str = "AI Financial Planning System"
    debug: bool = False
    log_level: str = "INFO"
    
    # Chainlit settings
    chainlit_host: str = "0.0.0.0"
    chainlit_port: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()