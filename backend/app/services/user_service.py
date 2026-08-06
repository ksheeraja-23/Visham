from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin, UserUpdate, ChangePassword

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)

class UserService:

    def __init__(self):
        self.repository = UserRepository()

    def create_user(self, db: Session, user: UserCreate):

        existing_username = self.repository.get_user_by_username(
            db,
            user.username
        )

        if existing_username:
            raise HTTPException(
                status_code=400,
                detail="Username already exists"
            )

        existing_email = self.repository.get_user_by_email(
            db,
            user.email
        )

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )
        hashed_password = hash_password(user.password)
        return self.repository.create_user(
            db,
            user,
            hashed_password
        )
    def login_user(self, db: Session, user: UserLogin):

        db_user = self.repository.get_user_by_username(
        db,
        user.username
    )

        if not db_user:
            raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

        if not verify_password(
            user.password,
            db_user.password
    ):
            raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

        access_token = create_access_token(
    {
        "sub": db_user.username,
        "role": db_user.role,
        "tv": db_user.token_version or 0
    }
)

        return {
    "access_token": access_token,
    "token_type": "bearer"
}

    def update_profile(self, db: Session, current_user, data: UserUpdate):

        if data.email != current_user.email:
            existing_email = self.repository.get_user_by_email(db, data.email)
            if existing_email and existing_email.id != current_user.id:
                raise HTTPException(
                    status_code=400,
                    detail="Email already in use"
                )

        return self.repository.update_profile(
            db,
            current_user,
            data.full_name,
            data.designation,
            data.email
        )

    def change_password(self, db: Session, current_user, data: ChangePassword):

        if not verify_password(data.current_password, current_user.password):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect"
            )

        hashed = hash_password(data.new_password)
        self.repository.update_password(db, current_user, hashed)

        # Changing the password also invalidates existing sessions.
        self.repository.increment_token_version(db, current_user)

        return {"message": "Password updated successfully"}

    def logout_all_devices(self, db: Session, current_user):
        self.repository.increment_token_version(db, current_user)
        return {"message": "Logged out from all devices"}