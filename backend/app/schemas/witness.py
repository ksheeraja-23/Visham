from pydantic import BaseModel, ConfigDict


class WitnessCreate(BaseModel):

    case_id: int
    full_name: str
    contact_info: str | None = None
    statement: str
    credibility: str = "Medium"
    status: str = "Interviewed"


class WitnessUpdate(BaseModel):

    full_name: str
    contact_info: str | None = None
    statement: str
    credibility: str
    status: str


class WitnessResponse(BaseModel):

    id: int
    case_id: int
    full_name: str
    contact_info: str | None
    statement: str
    credibility: str
    status: str

    model_config = ConfigDict(
        from_attributes=True
    )