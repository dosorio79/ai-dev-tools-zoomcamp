from pathlib import Path
import sys

import pytest
from fastapi.testclient import TestClient

# Make the backend/ directory importable so we can load the FastAPI app
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from app.core.store import store  # noqa: E402
from app.main import app  # noqa: E402


client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_store():
    """Ensure clean in-memory state between tests."""
    store.users.clear()
    store.tokens.clear()
    store.leaderboard.clear()
    store.live_games.clear()
    yield
    store.users.clear()
    store.tokens.clear()
    store.leaderboard.clear()
    store.live_games.clear()


def signup_user(email: str = "user@example.com", username: str = "user", password: str = "password") -> dict:
    response = client.post(
        "/auth/signup",
        json={"email": email, "username": username, "password": password},
    )
    assert response.status_code in (200, 201)
    return response.json()


def test_signup_and_me():
    auth = signup_user()
    token = auth["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/auth/me", headers=headers)
    assert resp.status_code == 200
    user = resp.json()
    assert user["email"] == "user@example.com"
    assert user["username"] == "user"


def test_duplicate_signup_rejected():
    signup_user()
    resp = client.post("/auth/signup", json={"email": "user@example.com", "username": "other", "password": "password"})
    assert resp.status_code == 400
    assert "exists" in resp.json()["detail"].lower()


def test_login_success_and_failure():
    signup_user(email="login@example.com", username="login-user", password="secret12")
    good = client.post("/auth/login", json={"email": "login@example.com", "password": "secret12"})
    assert good.status_code == 200
    assert good.json()["access_token"]

    bad = client.post("/auth/login", json={"email": "login@example.com", "password": "wrongpw"})
    assert bad.status_code == 400
    assert bad.json()["detail"] == "Invalid credentials"


def test_logout_revokes_token():
    auth = signup_user(email="logout@example.com")
    token = auth["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post("/auth/logout", headers=headers)
    assert resp.status_code == 204

    # Subsequent authenticated requests should now fail
    after = client.get("/auth/me", headers=headers)
    assert after.status_code == 401


def test_leaderboard_requires_auth():
    resp = client.get("/leaderboard")
    assert resp.status_code == 401


def test_submit_and_get_leaderboard_with_filter():
    auth = signup_user(email="board@example.com", username="player")
    token = auth["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/leaderboard", headers=headers, json={"score": 100, "mode": "walls"})

    # second user to ensure multiple entries appear
    auth2 = signup_user(email="board2@example.com", username="player2")
    token2 = auth2["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}
    client.post("/leaderboard", headers=headers2, json={"score": 50, "mode": "pass-through"})

    all_resp = client.get("/leaderboard", headers=headers)
    assert all_resp.status_code == 200
    entries = all_resp.json()
    assert len(entries) == 2

    filtered = client.get("/leaderboard", headers=headers, params={"mode": "walls"})
    assert filtered.status_code == 200
    filtered_entries = filtered.json()
    assert len(filtered_entries) == 1
    assert filtered_entries[0]["mode"] == "walls"


def test_leaderboard_user_lookup_success_and_404():
    auth = signup_user(email="board2@example.com", username="player2")
    token = auth["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # No entries yet, so lookup should 404
    not_found = client.get(f"/leaderboard/{auth['user']['id']}", headers=headers)
    assert not_found.status_code == 404

    # After submitting a score, lookup should succeed
    client.post("/leaderboard", headers=headers, json={"score": 77, "mode": "walls"})
    found = client.get(f"/leaderboard/{auth['user']['id']}", headers=headers)
    assert found.status_code == 200
    body = found.json()
    assert body["username"] == "player2"
    assert body["mode"] == "walls"


def test_live_games_public_endpoints():
    resp = client.get("/live-games")
    assert resp.status_code == 200
    games = resp.json()
    assert isinstance(games, list)
    if games:
        game_id = games[0]["id"]
        detail = client.get(f"/live-games/{game_id}")
        assert detail.status_code == 200

    missing = client.get("/live-games/does-not-exist")
    assert missing.status_code == 404
