from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables / .env file."""

    app_name: str = "MorusuHQ API"
    environment: str = "development"
    database_url: str = "sqlite:///./morusuhq.db"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]
    google_client_id: str = ""
    google_client_secret: str = ""
    wyze_api_key: str = ""
    wyze_key_id: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
