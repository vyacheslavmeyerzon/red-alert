from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://redalert:changeme@db:5432/redalert"
    redis_url: str = "redis://redis:6379"
    poll_interval_ms: int = 2000
    demo_mode: bool = False

    oref_alerts_url: str = "https://www.oref.org.il/WarningMessages/alert/alerts.json"
    oref_history_url: str = "https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json"

    class Config:
        env_file = ".env"


settings = Settings()
