from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models, schemas, auth
from database import get_db

router = APIRouter()

@router.get("/user", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
