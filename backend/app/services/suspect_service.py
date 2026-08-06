from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.suspect_repository import SuspectRepository
from app.repositories.case_repository import CaseRepository
from app.schemas.suspect import (
    SuspectCreate,
    SuspectUpdate
)


class SuspectService:

    def __init__(self):
        self.repository = SuspectRepository()
        self.case_repository = CaseRepository()
        from app.services.graph_service import GraphService
        self.graph_service = GraphService()

    def create(self, db: Session, suspect: SuspectCreate):

        case = self.case_repository.get_case_by_id(
            db,
            suspect.case_id
        )

        if case is None:
            raise HTTPException(
                status_code=404,
                detail="Case not found"
            )

        db_suspect = self.repository.create(
            db,
            suspect
        )

        try:
            self.graph_service.upsert_suspect(db_suspect.id, {
                "full_name": db_suspect.full_name,
                "alias": db_suspect.alias or "",
                "risk_level": db_suspect.risk_level,
                "status": db_suspect.status
            }, db_suspect.case_id)
        except Exception as e:
            print(f"Graph Sync Error: {e}")

        return db_suspect

    def get_all(self, db: Session):
        return self.repository.get_all(db)

    def get_by_id(
        self,
        db: Session,
        suspect_id: int
    ):

        suspect = self.repository.get_by_id(
            db,
            suspect_id
        )

        if suspect is None:
            raise HTTPException(
                status_code=404,
                detail="Suspect not found"
            )

        return suspect

    def get_by_case(
        self,
        db: Session,
        case_id: int
    ):
        return self.repository.get_by_case(
            db,
            case_id
        )

    def update(
        self,
        db: Session,
        suspect_id: int,
        suspect: SuspectUpdate
    ):

        db_suspect = self.repository.get_by_id(
            db,
            suspect_id
        )

        if db_suspect is None:
            raise HTTPException(
                status_code=404,
                detail="Suspect not found"
            )

        updated_suspect = self.repository.update(
            db,
            db_suspect,
            suspect
        )

        try:
            self.graph_service.upsert_suspect(updated_suspect.id, {
                "full_name": updated_suspect.full_name,
                "alias": updated_suspect.alias or "",
                "risk_level": updated_suspect.risk_level,
                "status": updated_suspect.status
            }, updated_suspect.case_id)
        except Exception as e:
            print(f"Graph Sync Error: {e}")

        return updated_suspect

    def delete(
        self,
        db: Session,
        suspect_id: int
    ):

        db_suspect = self.repository.get_by_id(
            db,
            suspect_id
        )

        if db_suspect is None:
            raise HTTPException(
                status_code=404,
                detail="Suspect not found"
            )

        self.repository.delete(
            db,
            db_suspect
        )

        try:
            self.graph_service.delete_suspect(suspect_id)
        except Exception as e:
            print(f"Graph Sync Error: {e}")

        return {
            "message": "Suspect deleted successfully"
        }