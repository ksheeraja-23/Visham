from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.case import (
    CaseCreate,
    CaseUpdate,
    CaseResponse
)

from app.services.case_service import CaseService

from app.dependencies.auth import get_current_user
from app.models.user import User


router = APIRouter(
    prefix="/cases",
    tags=["Cases"]
)

service = CaseService()


@router.post(
    "/",
    response_model=CaseResponse
)
def create_case(
    case: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_case(
        db,
        case
    )


@router.get(
    "/",
    response_model=list[CaseResponse]
)
def get_all_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_all_cases(db)


@router.get(
    "/{case_id}",
    response_model=CaseResponse
)
def get_case_by_id(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_case_by_id(
        db,
        case_id
    )


@router.put(
    "/{case_id}",
    response_model=CaseResponse
)
def update_case(
    case_id: int,
    case: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.update_case(
        db,
        case_id,
        case
    )


@router.delete("/{case_id}")
def delete_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.delete_case(
        db,
        case_id
    )