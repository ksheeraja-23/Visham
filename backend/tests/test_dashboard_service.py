from app.services.dashboard_service import DashboardService


class FakeRepository:
    def total_cases(self, db):
        return 3

    def total_active_cases(self, db):
        return 2

    def total_closed_cases(self, db):
        return 1

    def total_evidence(self, db):
        return 5

    def total_suspects(self, db):
        return 2

    def total_witnesses(self, db):
        return 4


def test_get_summary_includes_witness_count():
    service = DashboardService()
    service.repository = FakeRepository()

    result = service.get_summary(None)

    assert result["cases"] == 3
    assert result["active_cases"] == 2
    assert result["closed_cases"] == 1
    assert result["evidence"] == 5
    assert result["suspects"] == 2
    assert result["witnesses"] == 4
