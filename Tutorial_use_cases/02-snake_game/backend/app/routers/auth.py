from fastapi import APIRouter, Depends, Header, HTTPException, status, Response
from app.schemas.auth import LoginRequest, SignupRequest, AuthResponse, ErrorResponse
from app.core.store import store, StoredUser
from app.schemas.user import User

router = APIRouter()

def get_bearer_token(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    if token not in store.tokens:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return token

def get_current_user(token: str = Depends(get_bearer_token)) -> StoredUser:
    user_id = store.tokens[token]
    user = store.users.get(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup(payload: SignupRequest):
    try:
        user = store.add_user(payload.email, payload.username, payload.password)
    except ValueError as e:
        raise HTTPException(400, str(e))

    token = store.issue_token(user.id)
    return AuthResponse(user=user, access_token=token)

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    user = store.get_user_by_email(payload.email)
    if not user or user.password != payload.password:
        raise HTTPException(400, "Invalid credentials")
    token = store.issue_token(user.id)
    return AuthResponse(user=user, access_token=token)

@router.post("/logout", status_code=204)
def logout(token: str = Depends(get_bearer_token)):
    store.revoke_token(token)
    return Response(status_code=204)

@router.get("/me", response_model=User)
def me(current_user: StoredUser = Depends(get_current_user)):
    return current_user
