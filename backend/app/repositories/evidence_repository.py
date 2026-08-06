from sqlalchemy.orm import Session

from app.models.evidence import Evidence
from app.schemas.evidence import EvidenceCreate


class EvidenceRepository:

    def create_evidence(
        self,
        db: Session,
        evidence: EvidenceCreate,
        file_name: str,
        file_path: str
    ):

        db_evidence = Evidence(
            case_id=evidence.case_id,
            title=evidence.title,
            description=evidence.description,
            evidence_type=evidence.evidence_type,
            file_name=file_name,
            file_path=file_path,
            uploaded_by=evidence.uploaded_by
        )

        db.add(db_evidence)
        db.commit()
        db.refresh(db_evidence)

        return db_evidence

    def get_all_evidence(self, db: Session):

        return (
            db.query(Evidence)
            .all()
        )

    def get_evidence_by_id(
        self,
        db: Session,
        evidence_id: int
    ):

        return (
            db.query(Evidence)
            .filter(Evidence.id == evidence_id)
            .first()
        )

    def get_evidence_by_case(
        self,
        db: Session,
        case_id: int
    ):

        return (
            db.query(Evidence)
            .filter(Evidence.case_id == case_id)
            .all()
        )

    def delete_evidence(
        self,
        db: Session,
        evidence: Evidence
    ):

        db.delete(evidence)
        db.commit()