from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.timeline import (
    TimelineCreate,
    TimelineUpdate
)

from app.services.timeline_service import TimelineService

router = APIRouter(
    prefix="/timeline",
    tags=["Timeline"]
)

service = TimelineService()


@router.post("/")
def create_event(
    event: TimelineCreate,
    db: Session = Depends(get_db)
):
    return service.create(db, event)


@router.get("/")
def get_all_events(
    db: Session = Depends(get_db)
):
    return service.get_all(db)


@router.get("/{event_id}")
def get_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    return service.get_by_id(
        db,
        event_id
    )


@router.get("/case/{case_id}")
def get_case_timeline(
    case_id: int,
    db: Session = Depends(get_db)
):
    return service.get_by_case(
        db,
        case_id
    )


@router.put("/{event_id}")
def update_event(
    event_id: int,
    event: TimelineUpdate,
    db: Session = Depends(get_db)
):
    return service.update(
        db,
        event_id,
        event
    )


@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    return service.delete(
        db,
        event_id
    )