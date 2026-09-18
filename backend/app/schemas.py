from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from .models import UserRole, ParcelCategory, ParcelStatus


class UserCreate(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=6)
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class ParcelCreate(BaseModel):
    receiver_name: str = Field(min_length=2)
    receiver_phone: str
    receiver_address: str = Field(min_length=5)
    category: ParcelCategory
    weight_kg: float = Field(gt=0)
    price: float = Field(gt=0)


class ParcelUpdate(BaseModel):
    receiver_name: Optional[str] = None
    receiver_phone: Optional[str] = None
    receiver_address: Optional[str] = None
    category: Optional[ParcelCategory] = None
    weight_kg: Optional[float] = Field(default=None, gt=0)
    price: Optional[float] = Field(default=None, gt=0)


class ParcelStatusUpdate(BaseModel):
    status: ParcelStatus
    agent_id: Optional[int] = None


class ParcelResponse(BaseModel):
    id: int
    tracking_id: str
    sender_id: int
    receiver_name: str
    receiver_phone: str
    receiver_address: str
    category: ParcelCategory
    status: ParcelStatus
    agent_id: Optional[int]
    weight_kg: float
    price: float

    class Config:
        from_attributes = True



class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6)