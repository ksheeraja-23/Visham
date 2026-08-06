from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from reportlab.platypus import SimpleDocTemplate, Table

from app.database import get_db
from app.services.evidence_service import EvidenceService

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

service = EvidenceService()

@router.get("/evidence/{case_id}")
def generate_report(
    case_id: int,
    db: Session = Depends(get_db)
):

    evidence = service.get_evidence_by_case(db, case_id)

    filename = f"Evidence_Report_{case_id}.pdf"

    pdf = SimpleDocTemplate(filename)

    rows = [["Title","Type","Uploaded By"]]

    for e in evidence:
        rows.append([
            e.title,
            e.evidence_type,
            e.uploaded_by
        ])

    pdf.build([
        Table(rows)
    ])

    return FileResponse(
        filename,
        media_type="application/pdf",
        filename=filename
    )