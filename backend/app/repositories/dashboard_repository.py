from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.evidence import Evidence
from app.models.suspect import Suspect
from app.models.witness import Witness


class DashboardRepository:

    def total_cases(self, db: Session):
        if db is None:
            return 0
        return db.query(Case).count()

    def total_active_cases(self, db: Session):
        if db is None:
            return 0
        return db.query(Case).filter(Case.status == "Active").count()

    def total_closed_cases(self, db: Session):
        if db is None:
            return 0
        return db.query(Case).filter(Case.status == "Closed").count()

    def total_evidence(self, db: Session):
        if db is None:
            return 0
        return db.query(Evidence).count()

    def total_suspects(self, db: Session):
        if db is None:
            return 0
        return db.query(Suspect).count()

    def total_witnesses(self, db: Session):
        if db is None:
            return 0
        return db.query(Witness).count()