from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.repositories.preferences_repository import PreferencesRepository
from app.models.user import User

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)

repo = PreferencesRepository()


@router.get("/me")
def get_my_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pref = repo.get_by_user(db, current_user.id)
    if pref is None:
        # create with defaults
        pref = repo.create_for_user(db, current_user.id, {})
    # return as dict
    return {
        "user_id": pref.user_id,
        "dark_mode": pref.dark_mode,
        "compact_view": pref.compact_view,
        "font_size": pref.font_size,
        "accent_color": pref.accent_color,
        "notify_new_case": pref.notify_new_case,
        "notify_new_evidence": pref.notify_new_evidence,
        "notify_ai_complete": pref.notify_ai_complete,
        "notify_report_generated": pref.notify_report_generated,
        "default_landing": pref.default_landing,
        "default_graph_layout": pref.default_graph_layout,
        "timeline_order": pref.timeline_order,
        "auto_expand_evidence": pref.auto_expand_evidence,
    }


@router.post("/me")
def update_my_settings(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pref = repo.get_by_user(db, current_user.id)
    if pref is None:
        pref = repo.create_for_user(db, current_user.id, payload)
        return {"status": "created", "preferences": payload}

    updated = repo.update(db, pref, payload)
    return {"status": "updated", "preferences": {
        "dark_mode": updated.dark_mode,
        "compact_view": updated.compact_view,
        "font_size": updated.font_size,
        "accent_color": updated.accent_color,
        "notify_new_case": updated.notify_new_case,
        "notify_new_evidence": updated.notify_new_evidence,
        "notify_ai_complete": updated.notify_ai_complete,
        "notify_report_generated": updated.notify_report_generated,
        "default_landing": updated.default_landing,
        "default_graph_layout": updated.default_graph_layout,
        "timeline_order": updated.timeline_order,
        "auto_expand_evidence": updated.auto_expand_evidence,
    }}
