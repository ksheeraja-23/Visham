from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TimelineCreate(BaseModel):

    case_id: int

    event_time: datetime

    title: str

    description: str

    location: str | None = None


class TimelineUpdate(BaseModel):

    event_time: datetime

    title: str

    description: str

    location: str | None = None


class TimelineResponse(BaseModel):

    id: int

    case_id: int

    event_time: datetime

    title: str

    description: str

    location: str | None

    model_config = ConfigDict(
        from_attributes=True
    )