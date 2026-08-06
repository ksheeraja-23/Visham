from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate


class UserRepository:

    def create_user(
        self,
        db: Session,
        user: UserCreate,
        hashed_password: str
    ):
        db_user = User(
            username=user.username,
            email=user.email,
            password=hashed_password,
            full_name=user.full_name,
            designation=user.designation,
            role=user.role
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return db_user

    def get_user_by_username(self, db: Session, username: str):

        return (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

    def get_user_by_email(self, db: Session, email: str):

        return (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

    def get_user_by_id(self, db: Session, user_id: int):

        return (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

    def update_profile(
        self,
        db: Session,
        user: User,
        full_name: str,
        designation: str,
        email: str
    ):
        user.full_name = full_name
        user.designation = designation
        user.email = email

        db.commit()
        db.refresh(user)

        return user

    def update_password(
        self,
        db: Session,
        user: User,
        hashed_password: str
    ):
        user.password = hashed_password

        db.commit()
        db.refresh(user)

        return user

    def increment_token_version(self, db: Session, user: User):
        user.token_version = (user.token_version or 0) + 1

        db.commit()
        db.refresh(user)

        return user