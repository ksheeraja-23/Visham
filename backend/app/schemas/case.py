from datetime import date

from pydantic import BaseModel, Field


class CaseCreate(BaseModel):

    case_number: str = Field(..., max_length=50)

    title: str = Field(..., min_length=3, max_length=255)

    description: str = Field(..., min_length=10)

    status: str = Field(...)

    priority: str = Field(...)

    location: str = Field(...)

    incident_date: date

    created_by: str = Field(...)


class CaseUpdate(BaseModel):

    title: str = Field(..., min_length=3, max_length=255)

    description: str = Field(..., min_length=10)

    status: str = Field(...)

    priority: str = Field(...)

    location: str = Field(...)

    incident_date: date


class CaseResponse(BaseModel):

    id: int

    case_number: str

    title: str

    description: str

    status: str

    priority: str

    location: str

    incident_date: date

    created_by: str

    class Config:
        from_attributes = True