from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings with strict typing."""
    
    # Database Configuration
    database_url: str = "postgresql://poc3_user:poc3_password@postgres:5432/poc3_db"
    
    # Restack Configuration
    restack_engine_address: str = "restack-engine:5233"
    
    # OpenAI Configuration
    openai_api_key: Optional[str] = None
    
    # LangFuse Configuration
    langfuse_public_key: Optional[str] = None
    langfuse_secret_key: Optional[str] = None
    langfuse_host: str = "http://langfuse:3000"
    
    # Redis Configuration
    redis_url: str = "redis://redis:6379"
    
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