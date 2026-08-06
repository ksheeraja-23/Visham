from sqlalchemy.orm import Session

from app.models.witness import Witness
from app.schemas.witness import (
    WitnessCreate,
    WitnessUpdate
)


class WitnessRepository:

    def create(self, db: Session, witness: WitnessCreate):

        db_witness = Witness(
            **witness.model_dump()
        )

        db.add(db_witness)
        db.commit()
        db.refresh(db_witness)

        return db_witness

    def get_all(self, db: Session):
        return db.query(Witness).all()

    def get_by_id(
        self,
        db: Session,
        witness_id: int
    ):
        return (
            db.query(Witness)
            .filter(Witness.id == witness_id)
            .first()
        )

    def get_by_case(
        self,
        db: Session,
        case_id: int
    ):
        return (
            db.query(Witness)
            .filter(Witness.case_id == case_id)
            .all()
        )

    def update(
        self,
        db: Session,
        db_witness: Witness,
        witness: WitnessUpdate
    ):

        for key, value in witness.model_dump().items():
            setattr(db_witness, key, value)

        db.commit()
        db.refresh(db_witness)

        return db_witness

    def delete(
        self,
        db: Session,
        db_witness: Witness
    ):

        db.delete(db_witness)
        db.commit()