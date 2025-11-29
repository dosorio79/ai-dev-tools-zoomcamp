from datetime import datetime, timezone
from typing import Dict, Optional, List
from uuid import uuid4

from app.schemas.user import User
from app.schemas.leaderboard import LeaderboardEntry

class StoredUser(User):
    password: str

class InMemoryStore:
    def __init__(self) -> None:
        self.users: Dict[str, StoredUser] = {}
        self.tokens: Dict[str, str] = {}
        # user_id -> leaderboard entry
        self.leaderboard: Dict[str, LeaderboardEntry] = {}
        self.live_games: Dict[str, any] = {}  # replaced later with real schema

    def add_user(self, email: str, username: str, password: str) -> StoredUser:
        if any(u.email == email for u in self.users.values()):
            raise ValueError("Email already exists")
        user_id = str(uuid4())
        user = StoredUser(id=user_id, email=email, username=username, password=password)
        self.users[user_id] = user
        return user

    def get_user_by_email(self, email: str) -> Optional[StoredUser]:
        return next((u for u in self.users.values() if u.email == email), None)

    def issue_token(self, user_id: str) -> str:
        token = str(uuid4())
        self.tokens[token] = user_id
        return token

    def revoke_token(self, token: str) -> None:
        self.tokens.pop(token, None)

    def add_leaderboard_entry(self, user: StoredUser, score: int, mode: str) -> LeaderboardEntry:
        entry = LeaderboardEntry(
            id=str(uuid4()),
            username=user.username,
            score=score,
            mode=mode,
            date=datetime.now(timezone.utc),
        )
        self.leaderboard[user.id] = entry
        return entry

store = InMemoryStore()
