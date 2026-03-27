from pydantic import BaseModel, EmailStr
from typing import Optional

# Base schema for shared attributes
class UserBase(BaseModel):
    email: EmailStr

# Schema for creating a new user
class UserCreate(UserBase):
    password: str

# Schema for returning user data (response)
class UserResponse(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True
        from_attributes = True # for pydantic v2

# Schema for the JWT Token
class Token(BaseModel):
    access_token: str
    token_type: str

# Schema for JWT Token data
class TokenData(BaseModel):
    email: Optional[str] = None
