from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.ai.evidence_analyzer import EvidenceAnalyzer
from app.repositories.evidence_repository import EvidenceRepository
from app.repositories.case_repository import CaseRepository
from app.schemas.evidence import EvidenceCreate


class EvidenceService:

    def __init__(self):
        self.repository = EvidenceRepository()
        self.case_repository = CaseRepository()
        self.analyzer = EvidenceAnalyzer()
        from app.services.graph_service import GraphService
        self.graph_service = GraphService()

    def create_evidence(
        self,
        db: Session,
        evidence: EvidenceCreate,
        file_name: str,
        file_path: str
    ):
        case = self.case_repository.get_case_by_id(
            db,
            evidence.case_id
        )

        if case is None:
            raise HTTPException(
                status_code=404,
                detail="Case not found"
            )

        # Create basic evidence row in PostgreSQL
        db_evidence = self.repository.create_evidence(
            db,
            evidence,
            file_name,
            file_path
        )

        self._run_ai_analysis(db, db_evidence)

        return db_evidence

    def _run_ai_analysis(self, db: Session, db_evidence):
        """Runs AI analysis on an evidence row, persists the results, and
        synchronizes extracted entities into Neo4j. Used both at upload
        time and when an investigator explicitly (re)triggers analysis."""
        import json

        ai_data = None
        try:
            ai_data = self.analyzer.analyze(
                db_evidence.title,
                db_evidence.description or "",
                db_evidence.evidence_type
            )
        except Exception as e:
            print(f"AI Evidence Analysis failed: {e}")

        if not ai_data:
            return db_evidence

        db_evidence.ai_summary = ai_data.get("summary", "")
        db_evidence.ai_category = ai_data.get("category", "")
        db_evidence.ai_notes = ai_data.get("notes", "")

        keywords = ai_data.get("keywords", [])
        db_evidence.ai_keywords = json.dumps(keywords if isinstance(keywords, list) else [])

        entities = ai_data.get("entities", [])
        db_evidence.ai_entities = json.dumps(entities if isinstance(entities, list) else [])

        db.commit()
        db.refresh(db_evidence)

        # Synchronize with Neo4j
        try:
            self.graph_service.upsert_evidence(db_evidence.id, {
                "title": db_evidence.title,
                "description": db_evidence.description or "",
                "evidence_type": db_evidence.evidence_type,
                "file_name": db_evidence.file_name
            }, db_evidence.case_id)

            # Insert extracted entities as nodes and relationships in Neo4j
            if isinstance(ai_data.get("entities"), list):
                for ent in ai_data["entities"]:
                    # An entity can be a dict (e.g. {"type": "Person", "value": "Name"}) or string
                    if isinstance(ent, dict):
                        etype = ent.get("type", "Organization")
                        eval = ent.get("value", "")
                    else:
                        etype = "Organization"
                        eval = str(ent)

                    if eval:
                        self.graph_service.add_extracted_entity(
                            db_evidence.id,
                            etype,
                            eval,
                            "MENTIONED_IN"
                        )
        except Exception as e:
            print(f"Graph Sync Error: {e}")

        return db_evidence

    def analyze_evidence(
        self,
        db: Session,
        evidence_id: int
    ):
        """Explicitly (re)run AI analysis on an existing evidence item.
        Used by the 'AI Summary' and 'Entity Extraction' actions in the UI."""
        evidence = self.repository.get_evidence_by_id(
            db,
            evidence_id
        )

        if evidence is None:
            raise HTTPException(
                status_code=404,
                detail="Evidence not found"
            )

        return self._run_ai_analysis(db, evidence)

    def get_all_evidence(
        self,
        db: Session
    ):
        return self.repository.get_all_evidence(db)

    def get_evidence_by_id(
        self,
        db: Session,
        evidence_id: int
    ):

        evidence = self.repository.get_evidence_by_id(
            db,
            evidence_id
        )

        if evidence is None:
            raise HTTPException(
                status_code=404,
                detail="Evidence not found"
            )

        return evidence

    def get_evidence_by_case(
        self,
        db: Session,
        case_id: int
    ):
        return self.repository.get_evidence_by_case(
            db,
            case_id
        )

    def delete_evidence(
        self,
        db: Session,
        evidence_id: int
    ):

        evidence = self.repository.get_evidence_by_id(
            db,
            evidence_id
        )

        if evidence is None:
            raise HTTPException(
                status_code=404,
                detail="Evidence not found"
            )

        self.repository.delete_evidence(
            db,
            evidence
        )

        try:
            self.graph_service.delete_evidence(evidence_id)
        except Exception as e:
            print(f"Graph Sync Error: {e}")

        return {
            "message": "Evidence deleted successfully"
        }