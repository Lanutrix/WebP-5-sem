"""Pydantic-схемы запросов и ответов (валидация и сериализация JSON)."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from .models import OrderStatus, UserRole


# ---------- Auth / Users ----------
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=32)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    name: str
    phone: str | None
    role: UserRole
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Services ----------
class ServiceBase(BaseModel):
    slug: str = Field(min_length=2, max_length=80, pattern=r"^[a-z0-9-]+$")
    title: str = Field(min_length=2, max_length=160)
    description: str = ""
    unit: str = Field(min_length=1, max_length=40)
    price_per_unit: float = Field(gt=0)
    min_quantity: float = Field(default=1, gt=0)
    image: str | None = None
    active: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=160)
    description: str | None = None
    unit: str | None = Field(default=None, min_length=1, max_length=40)
    price_per_unit: float | None = Field(default=None, gt=0)
    min_quantity: float | None = Field(default=None, gt=0)
    image: str | None = None
    active: bool | None = None


class ServiceOut(ServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


# ---------- Orders ----------
class OrderItemIn(BaseModel):
    service_id: int
    quantity: float = Field(gt=0, le=10000)


class OrderCreate(BaseModel):
    items: list[OrderItemIn] = Field(default_factory=list)
    name: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=32)
    email: EmailStr | None = None
    comment: str = Field(default="", max_length=2000)

    @field_validator("comment")
    @classmethod
    def strip_comment(cls, v: str) -> str:
        return v.strip()


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service_id: int
    service_title: str
    unit: str
    quantity: float
    unit_price: float
    line_total: float


class OrderHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: OrderStatus
    note: str
    changed_by: str
    created_at: datetime


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tracking_code: str
    user_id: int | None
    customer_name: str
    customer_phone: str
    customer_email: EmailStr
    comment: str
    status: OrderStatus
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemOut]
    history: list[OrderHistoryOut]


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    note: str = Field(default="", max_length=500)


class AdminStats(BaseModel):
    orders_total: int
    orders_new: int
    orders_paid: int
    orders_in_progress: int
    orders_completed: int
    orders_cancelled: int
    revenue_paid: float
    users_total: int
