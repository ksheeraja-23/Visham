from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.witness_repository import WitnessRepository
from app.repositories.case_repository import CaseRepository

from app.schemas.witness import (
    WitnessCreate,
    WitnessUpdate
)


class WitnessService:

    def __init__(self):
        self.repository = WitnessRepository()
        self.case_repository = CaseRepository()
        from app.services.graph_service import GraphService
        self.graph_service = GraphService()

    def create(self, db: Session, witness: WitnessCreate):

        case = self.case_repository.get_case_by_id(
            db,
            witness.case_id
        )

        if case is None:
            raise HTTPException(
                status_code=404,
                detail="Case not found"
            )

        db_witness = self.repository.create(
            db,
            witness
        )

        try:
            self.graph_service.upsert_witness(db_witness.id, {
                "full_name": db_witness.full_name,
                "credibility": db_witness.credibility,
                "status": db_witness.status
            }, db_witness.case_id)
        except Exception as e:
            print(f"Graph Sync Error: {e}")

        return db_witness

    def get_all(self, db: Session):
        return self.repository.get_all(db)

    def get_by_id(
        self,
        db: Session,
        witness_id: int
    ):

        witness = self.repository.get_by_id(
            db,
            witness_id
        )

        if witness is None:
            raise HTTPException(
                status_code=404,
                detail="Witness not found"
            )

        return witness

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
        witness_id: int,
        witness: WitnessUpdate
    ):

        db_witness = self.repository.get_by_id(
            db,
            witness_id
        )

        if db_witness is None:
            raise HTTPException(
                status_code=404,
                detail="Witness not found"
            )

        updated_witness = self.repository.update(
            db,
            db_witness,
            witness
        )

        try:
            self.graph_service.upsert_witness(updated_witness.id, {
                "full_name": updated_witness.full_name,
                "credibility": updated_witness.credibility,
                "status": updated_witness.status
            }, updated_witness.case_id)
        except Exception as e:
            print(f"Graph Sync Error: {e}")

        return updated_witness

    def delete(
        self,
        db: Session,
        witness_id: int
    ):

        db_witness = self.repository.get_by_id(
            db,
            witness_id
        )

        if db_witness is None:
            raise HTTPException(
                status_code=404,
                detail="Witness not found"
            )

        self.repository.delete(
            db,
            db_witness
        )

        try:
            self.graph_service.delete_witness(witness_id)
        except Exception as e:
            print(f"Graph Sync Error: {e}")

        return {
            "message": "Witness deleted successfully"
        }