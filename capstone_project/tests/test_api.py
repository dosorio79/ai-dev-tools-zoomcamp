# API contract tests
from unittest.mock import patch

from fastapi.testclient import TestClient
from app.main import app
import pytest

pytestmark = pytest.mark.api

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_lesson_endpoint():
    response = client.post(
        "/lesson",
        json={
            "session_id": "5c05c610-1d1a-4b3d-8b66-9c7b8c4d6c2f",
            "topic": "pandas groupby performance",
            "level": "beginner",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["total_minutes"] == 15
    assert body["objective"].startswith("Learn pandas groupby performance")
    assert isinstance(body["sections"], list)
    assert body["sections"][0]["id"] == "concept"


def test_lesson_inserts_telemetry():
    with patch("app.services.lesson_service.insert_lesson_run") as mock_insert:
        response = client.post("/lesson", json={"topic": "x", "level": "beginner"})
        assert response.status_code == 200
        mock_insert.assert_called_once()
        doc = mock_insert.call_args.args[0]
        assert doc["topic"] == "x"
        assert doc["level"] == "beginner"
        assert "session_id" in doc
