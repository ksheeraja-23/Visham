from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    String,
    ForeignKey,
    Text
)

from app.models.base import Base


class Preferences(Base):

    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    dark_mode = Column(Boolean, default=True)

    compact_view = Column(Boolean, default=False)

    font_size = Column(String(20), default="medium")

    accent_color = Column(String(20), default="cyan")

    notify_new_case = Column(Boolean, default=True)

    notify_new_evidence = Column(Boolean, default=True)

    notify_ai_complete = Column(Boolean, default=True)

    notify_report_generated = Column(Boolean, default=True)

    default_landing = Column(String(50), default="dashboard")

    default_graph_layout = Column(String(50), default="force")

    timeline_order = Column(String(20), default="newest")

    auto_expand_evidence = Column(Boolean, default=False)
