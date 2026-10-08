"""Админ-панель: список заявок, смена статуса, удаление, статистика, пользователи."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from ..auth import get_admin_user
from ..database import get_db
from ..models import Order, OrderStatus, OrderStatusHistory, User
from ..schemas import AdminStats, OrderOut, OrderStatusUpdate, UserOut

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(get_admin_user)],
)

# Допустимые переходы статусов
_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.new: {OrderStatus.paid, OrderStatus.cancelled},
    OrderStatus.paid: {OrderStatus.in_progress, OrderStatus.cancelled},
    OrderStatus.in_progress: {OrderStatus.completed, OrderStatus.cancelled},
    OrderStatus.completed: set(),
    OrderStatus.cancelled: set(),
}


@router.get("/stats", response_model=AdminStats)
def stats(db: Session = Depends(get_db)):
    counts = dict(
        db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    )
    revenue = (
        db.query(func.coalesce(func.sum(Order.total), 0.0))
        .filter(Order.status.in_([OrderStatus.paid, OrderStatus.in_progress, OrderStatus.completed]))
        .scalar()
    )
    return AdminStats(
        orders_total=sum(counts.values()),
        orders_new=counts.get(OrderStatus.new, 0),
        orders_paid=counts.get(OrderStatus.paid, 0),
        orders_in_progress=counts.get(OrderStatus.in_progress, 0),
        orders_completed=counts.get(OrderStatus.completed, 0),
        orders_cancelled=counts.get(OrderStatus.cancelled, 0),
        revenue_paid=float(revenue or 0),
        users_total=db.query(User).count(),
    )


@router.get("/orders", response_model=list[OrderOut])
def list_orders(
    status_filter: OrderStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
):
    query = db.query(Order).options(selectinload(Order.items), selectinload(Order.history))
    if status_filter is not None:
        query = query.filter(Order.status == status_filter)
    return query.order_by(Order.created_at.desc()).all()


@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def update_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    order = (
        db.query(Order)
        .options(selectinload(Order.items), selectinload(Order.history))
        .filter(Order.id == order_id)
        .first()
    )
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Заявка не найдена")
    if payload.status == order.status:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Заявка уже в этом статусе")
    if payload.status not in _TRANSITIONS[order.status]:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Переход {order.status.value} → {payload.status.value} недопустим",
        )

    order.status = payload.status
    order.history.append(
        OrderStatusHistory(status=payload.status, note=payload.note, changed_by=admin.email)
    )
    db.commit()
    db.refresh(order)
    return order


@router.delete("/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Заявка не найдена")
    db.delete(order)
    db.commit()
    return None


@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()
