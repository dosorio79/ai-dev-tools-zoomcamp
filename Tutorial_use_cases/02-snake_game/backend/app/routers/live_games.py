from fastapi import APIRouter, HTTPException
from app.schemas.live_games import LiveGame
from datetime import datetime, timezone
from uuid import uuid4
from app.core.store import store

router = APIRouter()

def seed_games():
    if store.live_games:
        return
    now = datetime.now(timezone.utc)
    for username, mode in [("alice", "pass-through"), ("bob", "walls")]:
        gid = str(uuid4())
        store.live_games[gid] = LiveGame(
            id=gid,
            username=username,
            currentScore=42 if username == "alice" else 13,
            mode=mode,
            startedAt=now,
        )

@router.get("/", response_model=list[LiveGame])
def list_games():
    seed_games()
    return list(store.live_games.values())

@router.get("/{gameId}", response_model=LiveGame)
def get_game(gameId: str):
    seed_games()
    game = store.live_games.get(gameId)
    if not game:
        raise HTTPException(404, "Live game not found")
    return game
