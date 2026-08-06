from sqlalchemy.orm import Session

from app.models.timeline import TimelineEvent

from app.schemas.timeline import (
    TimelineCreate,
    TimelineUpdate
)


class TimelineRepository:

    def create(self, db: Session, event: TimelineCreate):

        db_event = TimelineEvent(
            **event.model_dump()
        )

        db.add(db_event)
        db.commit()
        db.refresh(db_event)

        return db_event

    def get_all(self, db: Session):

        return (
            db.query(TimelineEvent)
            .order_by(TimelineEvent.event_time)
            .all()
        )

    def get_by_case(
        self,
        db: Session,
        case_id: int
    ):

        return (
            db.query(TimelineEvent)
            .filter(TimelineEvent.case_id == case_id)
            .order_by(TimelineEvent.event_time)
            .all()
        )

    def get_by_id(
        self,
        db: Session,
        event_id: int
    ):

        return (
            db.query(TimelineEvent)
            .filter(TimelineEvent.id == event_id)
            .first()
        )

    def update(
        self,
        db: Session,
        db_event: TimelineEvent,
        event: TimelineUpdate
    ):

        for key, value in event.model_dump().items():
            setattr(db_event, key, value)

        db.commit()
        db.refresh(db_event)

        return db_event

    def delete(
        self,
        db: Session,
        db_event: TimelineEvent
    ):

        db.delete(db_event)
        db.commit()