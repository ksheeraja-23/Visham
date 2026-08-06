from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.suspect import (
    SuspectCreate,
    SuspectUpdate
)

from app.services.suspect_service import SuspectService

router = APIRouter(
    prefix="/suspects",
    tags=["Suspects"]
)

service = SuspectService()


@router.post("/")
def create_suspect(
    suspect: SuspectCreate,
    db: Session = Depends(get_db)
):
    return service.create(
        db,
        suspect
    )


@router.get("/")
def get_all_suspects(
    db: Session = Depends(get_db)
):
    return service.get_all(db)


@router.get("/{suspect_id}")
def get_suspect(
    suspect_id: int,
    db: Session = Depends(get_db)
):
    return service.get_by_id(
        db,
        suspect_id
    )


@router.get("/case/{case_id}")
def get_case_suspects(
    case_id: int,
    db: Session = Depends(get_db)
):
    return service.get_by_case(
        db,
        case_id
    )


@router.put("/{suspect_id}")
def update_suspect(
    suspect_id: int,
    suspect: SuspectUpdate,
    db: Session = Depends(get_db)
):
    return service.update(
        db,
        suspect_id,
        suspect
    )


@router.delete("/{suspect_id}")
def delete_suspect(
    suspect_id: int,
    db: Session = Depends(get_db)
):
    return service.delete(
        db,
        suspect_id
    )