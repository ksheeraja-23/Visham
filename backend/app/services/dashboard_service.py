from sqlalchemy.orm import Session

from app.repositories.dashboard_repository import DashboardRepository


class DashboardService:

    def __init__(self):
        self.repository = DashboardRepository()

    def get_summary(self, db: Session):
        return {
            "cases": self.repository.total_cases(db),
            "active_cases": self.repository.total_active_cases(db),
            "closed_cases": self.repository.total_closed_cases(db),
            "evidence": self.repository.total_evidence(db),
            "suspects": self.repository.total_suspects(db),
            "witnesses": self.repository.total_witnesses(db),
            "ai_reports": 12,
        }