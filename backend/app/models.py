from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import Integer, String, Text, DateTime, Float, ARRAY, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    oref_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    category: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    category_desc: Mapped[str | None] = mapped_column(String(255))
    title: Mapped[str | None] = mapped_column(String(512))
    description: Mapped[str | None] = mapped_column(Text)
    cities: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=[])
    raw_json: Mapped[dict | None] = mapped_column(JSONB)
    alerted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    centroid_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    centroid_lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    centroid = mapped_column(Geometry("POINT", srid=4326), nullable=True)
