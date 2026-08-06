from datetime import datetime, date
from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.evidence import Evidence
from app.models.suspect import Suspect
from app.models.timeline import TimelineEvent
from app.models.witness import Witness


def seed_isabella_case(db: Session) -> bool:
    """Seeds the Isabella Stewart Gardner Museum Heist case if the database
    is empty. Returns True if seeding occurred, False if data already existed."""
    existing_case = db.query(Case).first()
    if existing_case:
        return False

    case = Case(
        case_number="VSH-2026-001",
        title="Isabella Stewart Gardner Museum Heist",
        description="A high-profile museum theft investigation involving missing masterpieces, suspect interviews, timeline reconstruction, and evidence review.",
        status="Active",
        priority="High",
        location="Boston, Massachusetts",
        incident_date=date(1990, 3, 18),
        created_by="System",
    )
    db.add(case)
    db.flush()

    suspects = [
        Suspect(case_id=case.id, full_name="George Reissfelder", alias="The Locksmith", nationality="American", risk_level="High", status="Under Investigation", notes="Known for prior art theft connections."),
        Suspect(case_id=case.id, full_name="David Turner", alias="The Broker", nationality="American", risk_level="High", status="Under Investigation", notes="Linked to private art sales network."),
        Suspect(case_id=case.id, full_name="Robert Gentile", alias="The Collector", nationality="American", risk_level="Critical", status="Under Investigation", notes="Repeatedly mentioned in relation to the stolen works."),
        Suspect(case_id=case.id, full_name="Thieves' Network", alias="Unknown Syndicate", nationality="Unknown", risk_level="Critical", status="Active", notes="Potentially organized criminal network."),
    ]
    db.add_all(suspects)

    witnesses = [
        Witness(case_id=case.id, full_name="Elaine C. Spaulding", contact_info="investigator@museum.org", statement="Observed unusual activity near the museum loading dock the night of the theft.", credibility="High", status="Interviewed"),
        Witness(case_id=case.id, full_name="Michael A. McCarthy", contact_info="mccarthy@bostonpd.org", statement="Reported a suspicious van parked outside the museum before the alarm was triggered.", credibility="Medium", status="Interviewed"),
    ]
    db.add_all(witnesses)

    timeline_events = [
        TimelineEvent(case_id=case.id, event_time=datetime(1990, 3, 18, 1, 0), title="Museum alarm triggered", description="Security system detected movement near the empty frames display."),
        TimelineEvent(case_id=case.id, event_time=datetime(1990, 3, 18, 2, 15), title="Thieves enter museum", description="Access was gained through a side entrance and the guard was tied up."),
        TimelineEvent(case_id=case.id, event_time=datetime(1990, 3, 18, 2, 45), title="Stolen artworks removed", description="Thirteen artworks were removed from the museum collection."),
        TimelineEvent(case_id=case.id, event_time=datetime(1990, 3, 19, 8, 0), title="Investigation opened", description="Federal and local investigators launched a coordinated response."),
    ]
    db.add_all(timeline_events)

    evidence_items = [
        Evidence(case_id=case.id, title="Museum Security Footage", description="CCTV footage from the western entrance", evidence_type="video", file_name="seed_footage.mp4", file_path="uploads/seed_footage.mp4", uploaded_by="System"),
        Evidence(case_id=case.id, title="Police Interview Notes", description="Witness interview notes regarding suspicious vehicle", evidence_type="pdf", file_name="seed_notes.pdf", file_path="uploads/seed_notes.pdf", uploaded_by="System"),
    ]
    db.add_all(evidence_items)

    db.commit()

    return True
