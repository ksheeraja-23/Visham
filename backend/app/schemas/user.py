from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):

    username: str = Field(..., min_length=3, max_length=50)

    email: EmailStr

    password: str = Field(..., min_length=8)

    full_name: str = Field(..., min_length=3, max_length=255)

    designation: str = Field(..., min_length=2, max_length=100)

    role: str = Field(..., min_length=2, max_length=50)

class UserLogin(BaseModel):

    username: str

    password: str


class UserUpdate(BaseModel):

    full_name: str = Field(..., min_length=3, max_length=255)

    designation: str = Field(..., min_length=2, max_length=100)

    email: EmailStr


class ChangePassword(BaseModel):

    current_password: str = Field(..., min_length=1)

    new_password: str = Field(..., min_length=8)


class UserResponse(BaseModel):

    id: int
    username: str
    email: str
    full_name: str
    designation: str
    role: str

    class Config:
        from_attributes = True