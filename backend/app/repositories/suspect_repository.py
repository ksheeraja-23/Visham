from sqlalchemy.orm import Session

from app.models.suspect import Suspect
from app.schemas.suspect import (
    SuspectCreate,
    SuspectUpdate
)


class SuspectRepository:

    def create(self, db: Session, suspect: SuspectCreate):

        db_suspect = Suspect(**suspect.model_dump())

        db.add(db_suspect)
        db.commit()
        db.refresh(db_suspect)

        return db_suspect

    def get_all(self, db: Session):

        return db.query(Suspect).all()

    def get_by_id(
        self,
        db: Session,
        suspect_id: int
    ):

        return (
            db.query(Suspect)
            .filter(Suspect.id == suspect_id)
            .first()
        )

    def get_by_case(
        self,
        db: Session,
        case_id: int
    ):

        return (
            db.query(Suspect)
            .filter(Suspect.case_id == case_id)
            .all()
        )

    def update(
        self,
        db: Session,
        db_suspect: Suspect,
        suspect: SuspectUpdate
    ):

        for key, value in suspect.model_dump().items():
            setattr(db_suspect, key, value)

        db.commit()
        db.refresh(db_suspect)

        return db_suspect

    def delete(
        self,
        db: Session,
        db_suspect: Suspect
    ):

        db.delete(db_suspect)
        db.commit()