from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.ai.report_service import ReportService
from app.ai.report_exporter import ReportExporter
from app.database import get_db
from app.ai.service import AIService
from app.ai.repository import AIRepository

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)

service = AIService()
report_service = ReportService()
report_exporter = ReportExporter()
repository = AIRepository()

class ChatRequest(BaseModel):
    question: str

@router.post("/chat")
def chat(request: ChatRequest):
    return {
        "answer": service.chat(
            request.question
        )
    }

@router.post("/case/{case_id}/chat")
def case_chat(
    case_id: int,
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    return {
        "answer": service.case_chat(
            db,
            case_id,
            request.question
        )
    }

@router.post("/case/{case_id}/report")
def generate_report(
    case_id: int,
    db: Session = Depends(get_db)
):
    return {
        "report": report_service.generate_report(
            db,
            case_id
        )
    }

@router.post("/case/{case_id}/summarize")
def summarize_case(
    case_id: int,
    db: Session = Depends(get_db)
):
    return {
        "summary": service.generate_summary(
            db,
            case_id
        )
    }

@router.post("/case/{case_id}/contradictions")
def detect_contradictions(
    case_id: int,
    db: Session = Depends(get_db)
):
    return {
        "contradictions": service.detect_contradictions(
            db,
            case_id
        )
    }

@router.post("/case/{case_id}/risk-analysis")
def risk_analysis(
    case_id: int,
    db: Session = Depends(get_db)
):
    return {
        "risk_analysis": service.risk_analysis(
            db,
            case_id
        )
    }

@router.get("/case/{case_id}/export-pdf")
def export_pdf(
    case_id: int,
    db: Session = Depends(get_db)
):
    data = repository.get_case_context(db, case_id)
    if not data:
        raise HTTPException(status_code=404, detail="Case not found")
    
    summary_text = report_service.generate_report(db, case_id)
    pdf_buf = report_exporter.export_pdf(
        case_title=data["case"].title,
        case_number=data["case"].case_number,
        summary_text=summary_text,
        evidence_list=data["evidence"],
        suspect_list=data["suspects"],
        witness_list=data["witnesses"],
        timeline_events=data["timeline"]
    )
    
    return StreamingResponse(
        pdf_buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=case_{case_id}_report.pdf"}
    )

@router.get("/case/{case_id}/export-docx")
def export_docx(
    case_id: int,
    db: Session = Depends(get_db)
):
    data = repository.get_case_context(db, case_id)
    if not data:
        raise HTTPException(status_code=404, detail="Case not found")
    
    summary_text = report_service.generate_report(db, case_id)
    docx_buf = report_exporter.export_docx(
        case_title=data["case"].title,
        case_number=data["case"].case_number,
        summary_text=summary_text,
        evidence_list=data["evidence"],
        suspect_list=data["suspects"],
        witness_list=data["witnesses"],
        timeline_events=data["timeline"]
    )
    
    return StreamingResponse(
        docx_buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename=case_{case_id}_report.docx"}
    )