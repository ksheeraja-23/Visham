from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    Date,
    DateTime
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class Suspect(Base):

    __tablename__ = "suspects"

    id = Column(Integer, primary_key=True, index=True)

    case_id = Column(
        Integer,
        ForeignKey("cases.id"),
        nullable=False
    )

    full_name = Column(String(255), nullable=False)

    alias = Column(String(255))

    nationality = Column(String(100))

    date_of_birth = Column(Date)

    risk_level = Column(
        String(20),
        default="Medium"
    )

    status = Column(
        String(30),
        default="Under Investigation"
    )

    notes = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    case = relationship(
        "Case",
        backref="suspects"
    )