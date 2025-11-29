from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.leaderboard import LeaderboardEntry, SubmitScoreRequest
from app.core.store import store, StoredUser
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=list[LeaderboardEntry])
def get_top_scores(mode: str | None = None, user: StoredUser = Depends(get_current_user)):
    entries = list(store.leaderboard.values())
    if mode:
        entries = [e for e in entries if e.mode == mode]
    return entries

@router.post("/", status_code=201)
def submit_score(payload: SubmitScoreRequest, user: StoredUser = Depends(get_current_user)):
    store.add_leaderboard_entry(user, payload.score, payload.mode)
    return {"status": "ok"}

@router.get("/{userId}", response_model=LeaderboardEntry)
def get_user(userId: str, user: StoredUser = Depends(get_current_user)):
    entry = store.leaderboard.get(userId)
    if entry:
        return entry
    raise HTTPException(404, "User not found on leaderboard")
