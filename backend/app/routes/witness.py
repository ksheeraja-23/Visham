from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.witness import (
    WitnessCreate,
    WitnessUpdate
)

from app.services.witness_service import WitnessService

router = APIRouter(
    prefix="/witnesses",
    tags=["Witnesses"]
)

service = WitnessService()


@router.post("/")
def create_witness(
    witness: WitnessCreate,
    db: Session = Depends(get_db)
):
    return service.create(db, witness)


@router.get("/")
def get_all_witnesses(
    db: Session = Depends(get_db)
):
    return service.get_all(db)


@router.get("/{witness_id}")
def get_witness(
    witness_id: int,
    db: Session = Depends(get_db)
):
    return service.get_by_id(
        db,
        witness_id
    )


@router.get("/case/{case_id}")
def get_case_witnesses(
    case_id: int,
    db: Session = Depends(get_db)
):
    return service.get_by_case(
        db,
        case_id
    )


@router.put("/{witness_id}")
def update_witness(
    witness_id: int,
    witness: WitnessUpdate,
    db: Session = Depends(get_db)
):
    return service.update(
        db,
        witness_id,
        witness
    )


@router.delete("/{witness_id}")
def delete_witness(
    witness_id: int,
    db: Session = Depends(get_db)
):
    return service.delete(
        db,
        witness_id
    )