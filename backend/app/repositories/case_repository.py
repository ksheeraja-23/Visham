from sqlalchemy.orm import Session

from app.models.case import Case
from app.schemas.case import CaseCreate, CaseUpdate


class CaseRepository:

    def create_case(
        self,
        db: Session,
        case: CaseCreate
    ):

        db_case = Case(
            case_number=case.case_number,
            title=case.title,
            description=case.description,
            status=case.status,
            priority=case.priority,
            location=case.location,
            incident_date=case.incident_date,
            created_by=case.created_by
        )

        db.add(db_case)
        db.commit()
        db.refresh(db_case)

        return db_case

    def get_all_cases(
        self,
        db: Session
    ):

        return db.query(Case).all()

    def get_case_by_id(
        self,
        db: Session,
        case_id: int
    ):

        return (
            db.query(Case)
            .filter(Case.id == case_id)
            .first()
        )

    def update_case(
        self,
        db: Session,
        case_id: int,
        case: CaseUpdate
    ):

        db_case = self.get_case_by_id(
            db,
            case_id
        )

        if db_case is None:
            return None

        db_case.title = case.title
        db_case.description = case.description
        db_case.status = case.status
        db_case.priority = case.priority
        db_case.location = case.location
        db_case.incident_date = case.incident_date

        db.commit()
        db.refresh(db_case)

        return db_case

    def delete_case(
        self,
        db: Session,
        case_id: int
    ):

        db_case = self.get_case_by_id(
            db,
            case_id
        )

        if db_case is None:
            return None

        db.delete(db_case)
        db.commit()

        return True