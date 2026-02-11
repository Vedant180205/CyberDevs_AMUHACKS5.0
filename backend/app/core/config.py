from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusIQ API"
    MONGO_URI: str
    DATABASE_NAME: str = "campusIQ"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days for hackathon ease
    GROQ_API_KEY: str
    GEMINI_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()