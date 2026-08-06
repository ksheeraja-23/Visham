from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.evidence import Evidence
from app.models.suspect import Suspect
from app.models.witness import Witness
from app.models.timeline import TimelineEvent


class AIRepository:

    def get_case_context(
        self,
        db: Session,
        case_id: int
    ):

        case = (
            db.query(Case)
            .filter(Case.id == case_id)
            .first()
        )

        if case is None:
            return None

        evidence = (
            db.query(Evidence)
            .filter(Evidence.case_id == case_id)
            .all()
        )

        suspects = (
            db.query(Suspect)
            .filter(Suspect.case_id == case_id)
            .all()
        )

        witnesses = (
            db.query(Witness)
            .filter(Witness.case_id == case_id)
            .all()
        )

        timeline = (
            db.query(TimelineEvent)
            .filter(TimelineEvent.case_id == case_id)
            .order_by(TimelineEvent.event_time)
            .all()
        )

        return {
            "case": case,
            "evidence": evidence,
            "suspects": suspects,
            "witnesses": witnesses,
            "timeline": timeline
        }