from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Date
)

from datetime import datetime

from sqlalchemy.orm import relationship

from app.models.base import Base


class Case(Base):

    __tablename__ = "cases"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    case_number = Column(
        String(50),
        unique=True,
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

    status = Column(
        String(50),
        default="Open"
    )

    priority = Column(
        String(20),
        default="Medium"
    )

    location = Column(
        String(255),
        nullable=False
    )

    incident_date = Column(
        Date,
        nullable=False
    )

    created_by = Column(
        String(100),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    evidence = relationship(
        "Evidence",
        back_populates="case",
        cascade="all, delete"
    )