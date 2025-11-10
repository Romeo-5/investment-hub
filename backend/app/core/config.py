from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """Application settings and configuration"""
    
    # Project Info
    PROJECT_NAME: str = "Investment Hub API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Server Config
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]
    
    # Schwab API Configuration (to be filled when approved)
    SCHWAB_API_KEY: str = os.getenv("SCHWAB_API_KEY", "")
    SCHWAB_API_SECRET: str = os.getenv("SCHWAB_API_SECRET", "")
    SCHWAB_REDIRECT_URI: str = os.getenv("SCHWAB_REDIRECT_URI", "http://localhost:3000/callback")
    SCHWAB_BASE_URL: str = "https://api.schwab.com/v1"
    
    # Database (optional - for caching)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./investment_hub.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # External APIs
    ALPHA_VANTAGE_API_KEY: str = os.getenv("ALPHA_VANTAGE_API_KEY", "")
    YAHOO_FINANCE_ENABLED: bool = True
    
    # ML Model Settings
    MODEL_CACHE_DIR: str = "./models"
    ENABLE_ML_PREDICTIONS: bool = True
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()