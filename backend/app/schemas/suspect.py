from datetime import date

from pydantic import BaseModel, ConfigDict


class SuspectCreate(BaseModel):

    case_id: int

    full_name: str

    alias: str | None = None

    nationality: str | None = None

    date_of_birth: date | None = None

    risk_level: str = "Medium"

    status: str = "Under Investigation"

    notes: str | None = None


class SuspectUpdate(BaseModel):

    full_name: str

    alias: str | None = None

    nationality: str | None = None

    date_of_birth: date | None = None

    risk_level: str

    status: str

    notes: str | None = None


class SuspectResponse(BaseModel):

    id: int

    case_id: int

    full_name: str

    alias: str | None

    nationality: str | None

    date_of_birth: date | None

    risk_level: str

    status: str

    notes: str | None

    model_config = ConfigDict(
        from_attributes=True
    )