from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, leaderboard, live_games

app = FastAPI(title="Snake Game API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["Leaderboard"])
app.include_router(live_games.router, prefix="/live-games", tags=["LiveGames"])

@app.get("/")
def root():
    return {"status": "ok", "message": "Snake API running"}


def start():
    """For `uv run app.start` or other tool-based launchers."""
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    # Allows running `python app/main.py` (rarely needed)
    start()
