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


class Witness(Base):

    __tablename__ = "witnesses"

    id = Column(Integer, primary_key=True, index=True)

    case_id = Column(
        Integer,
        ForeignKey("cases.id"),
        nullable=False
    )

    full_name = Column(
        String(255),
        nullable=False
    )

    contact_info = Column(
        String(255)
    )

    statement = Column(
        Text,
        nullable=False
    )

    credibility = Column(
        String(20),
        default="Medium"
    )

    status = Column(
        String(30),
        default="Interviewed"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    case = relationship(
        "Case",
        backref="witnesses"
    )