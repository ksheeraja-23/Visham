from sqlalchemy.orm import Session

from app.models.preferences import Preferences


class PreferencesRepository:

    def get_by_user(self, db: Session, user_id: int):
        return db.query(Preferences).filter(Preferences.user_id == user_id).first()

    def create_for_user(self, db: Session, user_id: int, data: dict):
        pref = Preferences(user_id=user_id, **data)
        db.add(pref)
        db.commit()
        db.refresh(pref)
        return pref

    def update(self, db: Session, pref: Preferences, data: dict):
        for k, v in data.items():
            if hasattr(pref, k):
                setattr(pref, k, v)
        db.commit()
        db.refresh(pref)
        return pref
