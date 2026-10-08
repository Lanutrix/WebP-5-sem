"""CRUD по услугам (прайс для калькулятора)."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..auth import get_admin_user
from ..database import get_db
from ..models import OrderItem, Service, User
from ..schemas import ServiceCreate, ServiceOut, ServiceUpdate

router = APIRouter(prefix="/api/services", tags=["services"])


def _get_or_404(db: Session, service_id: int) -> Service:
    service = db.get(Service, service_id)
    if service is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Услуга не найдена")
    return service


@router.get("", response_model=list[ServiceOut])
def list_services(
    include_inactive: bool = Query(default=False, description="Только для администратора"),
    db: Session = Depends(get_db),
):
    query = db.query(Service).order_by(Service.id)
    if not include_inactive:
        query = query.filter(Service.active.is_(True))
    return query.all()


@router.get("/{service_id}", response_model=ServiceOut)
def get_service(service_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, service_id)


@router.post("", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def create_service(
    payload: ServiceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    if db.query(Service).filter(Service.slug == payload.slug).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Услуга с таким slug уже есть")
    service = Service(**payload.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}", response_model=ServiceOut)
def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    service = _get_or_404(db, service_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    service = _get_or_404(db, service_id)
    used = db.query(OrderItem).filter(OrderItem.service_id == service_id).count()
    if used:
        # Услуга есть в заказах — скрываем, не ломая историю
        service.active = False
    else:
        db.delete(service)
    db.commit()
    return None
