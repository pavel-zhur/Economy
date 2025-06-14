from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings with strict typing."""
    
    # Database Configuration
    database_url: str = "postgresql://poc3_user:poc3_password@localhost:5432/poc3_db"
    
    # Restack Configuration
    restack_engine_address: str = "localhost:5233"
    
    # OpenAI Configuration
    openai_api_key: str
    
    # LangFuse Configuration
    langfuse_public_key: Optional[str] = None
    langfuse_secret_key: Optional[str] = None
    langfuse_host: str = "http://localhost:3001"
    
    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    
    # Application Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    
    # Monitoring
    enable_metrics: bool = True
    enable_tracing: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()