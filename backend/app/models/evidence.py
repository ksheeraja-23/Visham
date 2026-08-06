from sqlalchemy.orm import relationship
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Text
)

from sqlalchemy.sql import func

from app.models.base import Base


class Evidence(Base):

    __tablename__ = "evidence"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    case_id = Column(
        Integer,
        ForeignKey("cases.id"),
        nullable=False
    )

    title = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text
    )

    evidence_type = Column(
        String(50),
        nullable=False
    )

    file_name = Column(
        String(255),
        nullable=False
    )

    file_path = Column(
        String(500),
        nullable=False
    )

    uploaded_by = Column(
        String(100),
        nullable=False
    )

    ai_summary = Column(
    Text
)

    ai_keywords = Column(
    Text
)

    ai_entities = Column(
    Text
)

    ai_category = Column(
    String(100)
)

    ai_notes = Column(
    Text
)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    case = relationship(
    "Case",
    back_populates="evidence"
)