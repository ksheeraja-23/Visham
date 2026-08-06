from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.case_repository import CaseRepository
from app.schemas.case import CaseCreate, CaseUpdate


class CaseService:

    def __init__(self):
        self.repository = CaseRepository()
        from app.services.graph_service import GraphService
        self.graph_service = GraphService()

    def create_case(
        self,
        db: Session,
        case: CaseCreate
    ):
        db_case = self.repository.create_case(
            db,
            case
        )
        try:
            self.graph_service.upsert_case(db_case.id, {
                "case_number": db_case.case_number,
                "title": db_case.title,
                "description": db_case.description or "",
                "status": db_case.status,
                "priority": db_case.priority,
                "location": db_case.location,
                "incident_date": str(db_case.incident_date)
            })
        except Exception as e:
            print(f"Graph Sync Error: {e}")
        return db_case

    def get_all_cases(
        self,
        db: Session
    ):
        return self.repository.get_all_cases(db)

    def get_case_by_id(
        self,
        db: Session,
        case_id: int
    ):

        case = self.repository.get_case_by_id(
            db,
            case_id
        )

        if case is None:
            raise HTTPException(
                status_code=404,
                detail="Case not found"
            )

        return case

    def update_case(
        self,
        db: Session,
        case_id: int,
        case: CaseUpdate
    ):

        updated_case = self.repository.update_case(
            db,
            case_id,
            case
        )

        if updated_case is None:
            raise HTTPException(
                status_code=404,
                detail="Case not found"
            )

        try:
            self.graph_service.upsert_case(updated_case.id, {
                "case_number": updated_case.case_number,
                "title": updated_case.title,
                "description": updated_case.description or "",
                "status": updated_case.status,
                "priority": updated_case.priority,
                "location": updated_case.location,
                "incident_date": str(updated_case.incident_date)
            })
        except Exception as e:
            print(f"Graph Sync Error: {e}")

        return updated_case

    def delete_case(
        self,
        db: Session,
        case_id: int
    ):

        deleted = self.repository.delete_case(
            db,
            case_id
        )

        if deleted is None:
            raise HTTPException(
                status_code=404,
                detail="Case not found"
            )

        try:
            self.graph_service.delete_case(case_id)
        except Exception as e:
            print(f"Graph Sync Error: {e}")

        return {
            "message": "Case deleted successfully"
        }