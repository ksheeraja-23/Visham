from pydantic import BaseModel


class EvidenceCreate(BaseModel):

    case_id: int

    title: str

    description: str

    evidence_type: str

    uploaded_by: str


class EvidenceResponse(BaseModel):

    id: int
    case_id: int
    title: str
    description: str
    evidence_type: str
    file_name: str
    file_path: str
    uploaded_by: str
    ai_summary: str | None = None
    ai_keywords: str | None = None
    ai_entities: str | None = None
    ai_category: str | None = None
    ai_notes: str | None = None

    class Config:
        from_attributes = True
