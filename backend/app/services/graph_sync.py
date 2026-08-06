from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.evidence import Evidence
from app.models.suspect import Suspect
from app.models.witness import Witness
from app.models.timeline import TimelineEvent

from app.services.graph_service import GraphService


class GraphSyncService:

    def __init__(self):

        self.graph = GraphService()

    def sync_all(self, db: Session):

        print("Starting PostgreSQL → Neo4j Sync...")

        self.sync_cases(db)

        self.sync_suspects(db)

        self.sync_witnesses(db)

        self.sync_evidence(db)

        self.sync_timeline_events(db)

        print("Neo4j Sync Complete")

        return {

            "status": "success",

            "message": "Graph synchronized successfully."

        }
    
        # -------------------------------------------------
    # Sync Cases
    # -------------------------------------------------

    def sync_cases(self, db: Session):

        cases = db.query(Case).all()

        print(f"Syncing {len(cases)} cases...")

        for case in cases:

            self.graph.upsert_case(

                case.id,

                {
                    "case_number": case.case_number,
                    "title": case.title,
                    "description": case.description,
                    "status": case.status,
                    "priority": case.priority,
                    "location": case.location,
                    "incident_date": str(case.incident_date),
                }

            )

        print("Cases Synced")
        

    # -------------------------------------------------
    # Sync Suspects
    # -------------------------------------------------

    def sync_suspects(self, db: Session):

        suspects = db.query(Suspect).all()

        print(f"Syncing {len(suspects)} suspects...")

        for suspect in suspects:

            self.graph.upsert_suspect(

                suspect.id,

                {
                    "full_name": suspect.full_name,
                    "alias": suspect.alias,
                    "risk_level": suspect.risk_level,
                    "status": suspect.status,
                },

                suspect.case_id

            )

        print("Suspects Synced")

            # -------------------------------------------------
    # Sync Witnesses
    # -------------------------------------------------

    def sync_witnesses(self, db: Session):

        witnesses = db.query(Witness).all()

        print(f"Syncing {len(witnesses)} witnesses...")

        for witness in witnesses:

            self.graph.upsert_witness(

                witness.id,

                {
                    "full_name": witness.full_name,
                    "credibility": witness.credibility,
                    "status": witness.status,
                },

                witness.case_id

            )

        print("Witnesses Synced")


    # -------------------------------------------------
    # Sync Evidence
    # -------------------------------------------------

    def sync_evidence(self, db: Session):

        evidence_list = db.query(Evidence).all()

        print(f"Syncing {len(evidence_list)} evidence...")

        for evidence in evidence_list:

            self.graph.upsert_evidence(

                evidence.id,

                {
                    "title": evidence.title,
                    "description": evidence.description,
                    "evidence_type": evidence.evidence_type,
                    "file_name": evidence.file_name,
                },

                evidence.case_id

            )

        print("Evidence Synced")

    # -------------------------------------------------
    # Sync Timeline Events
    # -------------------------------------------------

    def sync_timeline_events(self, db: Session):

        events = db.query(TimelineEvent).all()

        print(f"Syncing {len(events)} timeline events...")

        for event in events:

            self.graph.upsert_timeline_event(

                event.id,

                {
                    "title": event.title,
                    "description": event.description,
                    "event_time": str(event.event_time),
                },

                event.case_id

            )

        print("Timeline Events Synced")