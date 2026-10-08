"""Заявки/заказы: оформление из корзины, история пользователя, трекинг гостя."""
import secrets
import string

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload

from ..auth import get_current_user, get_optional_user
from ..database import get_db
from ..models import Order, OrderItem, OrderStatus, OrderStatusHistory, Service, User, UserRole
from ..schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/api/orders", tags=["orders"])

_ALPHABET = string.ascii_uppercase + string.digits


def _new_tracking_code(db: Session) -> str:
    while True:
        code = "ZB-" + "".join(secrets.choice(_ALPHABET) for _ in range(6))
        if db.query(Order).filter(Order.tracking_code == code).first() is None:
            return code


def _load_order(db: Session, order_id: int) -> Order | None:
    return (
        db.query(Order)
        .options(selectinload(Order.items), selectinload(Order.history))
        .filter(Order.id == order_id)
        .first()
    )


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    """Создать заявку. Для гостя обязательны имя, телефон и email."""
    name = (payload.name or (user.name if user else "") or "").strip()
    phone = (payload.phone or (user.phone if user else "") or "").strip()
    email = (payload.email or (user.email if user else "") or "").strip().lower()

    if not name or not phone or not email:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Укажите имя, телефон и email (или войдите в аккаунт)",
        )
    if not payload.items and not payload.comment:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Добавьте услуги в заявку или опишите задачу в комментарии",
        )

    order = Order(
        tracking_code=_new_tracking_code(db),
        user_id=user.id if user else None,
        customer_name=name,
        customer_phone=phone,
        customer_email=email,
        comment=payload.comment,
        status=OrderStatus.new,
    )

    total = 0.0
    for item in payload.items:
        service = db.get(Service, item.service_id)
        if service is None or not service.active:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Услуга #{item.service_id} недоступна")
        if item.quantity < service.min_quantity:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Минимальный объём для «{service.title}» — {service.min_quantity:g} {service.unit}",
            )
        line_total = round(service.price_per_unit * item.quantity, 2)
        total += line_total
        order.items.append(
            OrderItem(
                service_id=service.id,
                service_title=service.title,
                unit=service.unit,
                quantity=item.quantity,
                unit_price=service.price_per_unit,
                line_total=line_total,
            )
        )

    order.total = round(total, 2)
    order.history.append(
        OrderStatusHistory(
            status=OrderStatus.new,
            note="Заявка создана" + (" (гость)" if user is None else ""),
            changed_by=user.email if user else "guest",
        )
    )

    db.add(order)
    db.commit()
    return _load_order(db, order.id)


@router.get("/my", response_model=list[OrderOut])
def my_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return (
        db.query(Order)
        .options(selectinload(Order.items), selectinload(Order.history))
        .filter(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("/track", response_model=OrderOut)
def track_order(
    code: str = Query(min_length=4, max_length=20),
    email: str = Query(min_length=3, max_length=255),
    db: Session = Depends(get_db),
):
    """Отслеживание заявки по коду и email (без входа в аккаунт)."""
    order = (
        db.query(Order)
        .options(selectinload(Order.items), selectinload(Order.history))
        .filter(Order.tracking_code == code.strip().upper())
        .first()
    )
    if order is None or order.customer_email.lower() != email.strip().lower():
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Заявка не найдена")
    return order


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = _load_order(db, order_id)
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Заявка не найдена")
    if user.role != UserRole.admin and order.user_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Нет доступа к этой заявке")
    return order
