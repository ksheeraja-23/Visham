import os
import uuid
import shutil
from fastapi.responses import FileResponse
import zipfile
import os
from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.services.evidence_service import EvidenceService
from app.schemas.evidence import EvidenceCreate

router = APIRouter(
    prefix="/evidence",
    tags=["Evidence"]
)

service = EvidenceService()


@router.post("/")
def upload_evidence(

    case_id: int = Form(...),

    title: str = Form(...),

    description: str = Form(...),

    evidence_type: str = Form(...),

    uploaded_by: str = Form(...),

    file: UploadFile = File(...),

    db: Session = Depends(get_db)

):

    upload_folder = "uploads"

    os.makedirs(
        upload_folder,
        exist_ok=True
    )

    extension = os.path.splitext(
        file.filename
    )[1]

    file_name = f"{uuid.uuid4()}{extension}"

    file_path = os.path.join(
        upload_folder,
        file_name
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    evidence = EvidenceCreate(
        case_id=case_id,
        title=title,
        description=description,
        evidence_type=evidence_type,
        uploaded_by=uploaded_by
    )

    return service.create_evidence(
        db,
        evidence,
        file_name,
        file_path
    )


@router.get("/")
def get_all_evidence(
    db: Session = Depends(get_db)
):
    return service.get_all_evidence(db)


@router.get("/{evidence_id}")
def get_evidence(
    evidence_id: int,
    db: Session = Depends(get_db)
):
    return service.get_evidence_by_id(
        db,
        evidence_id
    )


@router.get("/case/{case_id}")
def get_evidence_by_case(
    case_id: int,
    db: Session = Depends(get_db)
):
    return service.get_evidence_by_case(
        db,
        case_id
    )


@router.delete("/{evidence_id}")
def delete_evidence(
    evidence_id: int,
    db: Session = Depends(get_db)
):
    return service.delete_evidence(
        db,
        evidence_id
    )


@router.post("/{evidence_id}/analyze")
def analyze_evidence(
    evidence_id: int,
    db: Session = Depends(get_db)
):
    """(Re)runs AI summary + entity extraction on a single evidence item.
    Powers the 'AI Summary' and 'Entity Extraction' actions in the UI."""
    return service.analyze_evidence(
        db,
        evidence_id
    )


@router.get("/{evidence_id}/download")
def download_evidence(
    evidence_id: int,
    db: Session = Depends(get_db)
):
    evidence = service.get_evidence_by_id(db, evidence_id)

    if not os.path.exists(evidence.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        evidence.file_path,
        filename=evidence.file_name,
        media_type="application/octet-stream"
    )


@router.get("/download/{case_id}")
def download_case_evidence(
    case_id: int,
    db: Session = Depends(get_db)
):
    evidence = service.get_evidence_by_case(db, case_id)

    if not evidence:
        raise HTTPException(status_code=404, detail="No evidence found")

    zip_name = f"case_{case_id}_evidence.zip"

    with zipfile.ZipFile(zip_name, "w") as zipf:
        for item in evidence:
            if os.path.exists(item.file_path):
                zipf.write(
                    item.file_path,
                    arcname=item.file_name
                )

    return FileResponse(
        zip_name,
        filename=zip_name,
        media_type="application/zip"
    )