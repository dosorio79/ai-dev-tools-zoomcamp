from pydantic import BaseModel, EmailStr, Field
from app.schemas.user import User

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

class SignupRequest(BaseModel):
    email: EmailStr
    username: str
    password: str = Field(min_length=6)

class AuthResponse(BaseModel):
    user: User
    access_token: str
    token_type: str = "bearer"

class ErrorResponse(BaseModel):
    detail: str
