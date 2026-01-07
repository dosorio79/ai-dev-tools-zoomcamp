# API contract tests
from fastapi.testclient import TestClient
from app.main import app

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
