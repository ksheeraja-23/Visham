from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class TimelineEvent(Base):

    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)

    case_id = Column(
        Integer,
        ForeignKey("cases.id"),
        nullable=False
    )

    event_time = Column(
        DateTime,
        nullable=False
    )

    title = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    location = Column(
        String(255)
    )

    case = relationship(
        "Case",
        backref="timeline"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )