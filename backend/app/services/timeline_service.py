from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.timeline_repository import TimelineRepository
from app.repositories.case_repository import CaseRepository

from app.schemas.timeline import (
    TimelineCreate,
    TimelineUpdate
)


class TimelineService:

    def __init__(self):
        self.repository = TimelineRepository()
        self.case_repository = CaseRepository()
        from app.services.graph_service import GraphService
        self.graph_service = GraphService()

    def create(self, db: Session, event: TimelineCreate):

        case = self.case_repository.get_case_by_id(
            db,
            event.case_id
        )

        if case is None:
            raise HTTPException(
                status_code=404,
                detail="Case not found"
            )

        db_event = self.repository.create(
            db,
            event
        )

        try:
            self.graph_service.upsert_timeline_event(db_event.id, {
                "title": db_event.title,
                "description": db_event.description,
                "event_time": str(db_event.event_time)
            }, db_event.case_id)
        except Exception as e:
            print(f"Graph Sync Error: {e}")

        return db_event

    def get_all(self, db: Session):
        return self.repository.get_all(db)

    def get_by_case(
        self,
        db: Session,
        case_id: int
    ):
        return self.repository.get_by_case(
            db,
            case_id
        )

    def get_by_id(
        self,
        db: Session,
        event_id: int
    ):

        event = self.repository.get_by_id(
            db,
            event_id
        )

        if event is None:
            raise HTTPException(
                status_code=404,
                detail="Timeline event not found"
            )

        return event

    def update(
        self,
        db: Session,
        event_id: int,
        event: TimelineUpdate
    ):

        db_event = self.repository.get_by_id(
            db,
            event_id
        )

        if db_event is None:
            raise HTTPException(
                status_code=404,
                detail="Timeline event not found"
            )

        updated_event = self.repository.update(
            db,
            db_event,
            event
        )

        try:
            self.graph_service.upsert_timeline_event(updated_event.id, {
                "title": updated_event.title,
                "description": updated_event.description,
                "event_time": str(updated_event.event_time)
            }, updated_event.case_id)
        except Exception as e:
            print(f"Graph Sync Error: {e}")

        return updated_event

    def delete(
        self,
        db: Session,
        event_id: int
    ):

        db_event = self.repository.get_by_id(
            db,
            event_id
        )

        if db_event is None:
            raise HTTPException(
                status_code=404,
                detail="Timeline event not found"
            )

        self.repository.delete(
            db,
            db_event
        )

        try:
            self.graph_service.delete_timeline_event(event_id)
        except Exception as e:
            print(f"Graph Sync Error: {e}")

        return {
            "message": "Timeline event deleted successfully"
        }