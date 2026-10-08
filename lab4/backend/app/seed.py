"""Начальные данные: услуги с ценами и учётная запись администратора."""
from __future__ import annotations

from sqlalchemy.orm import Session

from .auth import hash_password
from .models import Service, User, UserRole

ADMIN_EMAIL = "admin@zelenybereg.ru"
ADMIN_PASSWORD = "admin12345"

SERVICES = [
    {
        "slug": "irrigation-design",
        "title": "Проектирование полива",
        "description": "Обследование участка, зонирование, схема оросителей и спецификация оборудования.",
        "unit": "сотка",
        "price_per_unit": 3500,
        "min_quantity": 1,
        "image": "/images/irrigation-design.jpg",
    },
    {
        "slug": "irrigation-installation",
        "title": "Монтаж систем полива",
        "description": "Прокладка магистралей, установка оросителей, клапанов и контроллера, пуско-наладка.",
        "unit": "сотка",
        "price_per_unit": 12000,
        "min_quantity": 1,
        "image": "/images/irrigation-installation.jpg",
    },
    {
        "slug": "irrigation-repair",
        "title": "Ремонт полива",
        "description": "Диагностика, устранение утечек, замена форсунок и клапанов, настройка контроллера.",
        "unit": "выезд",
        "price_per_unit": 4500,
        "min_quantity": 1,
        "image": "/images/irrigation-repair.jpg",
    },
    {
        "slug": "landscaping",
        "title": "Ландшафтный дизайн",
        "description": "Концепция участка, подбор растений, газон, отсыпки и элементы благоустройства.",
        "unit": "сотка",
        "price_per_unit": 8000,
        "min_quantity": 1,
        "image": "/images/landscaping.jpg",
    },
]


def seed(db: Session) -> None:
    if db.query(Service).count() == 0:
        for data in SERVICES:
            db.add(Service(**data))

    if db.query(User).filter(User.email == ADMIN_EMAIL).first() is None:
        db.add(
            User(
                email=ADMIN_EMAIL,
                password_hash=hash_password(ADMIN_PASSWORD),
                name="Администратор",
                phone="+7 (863) 555-12-34",
                role=UserRole.admin,
            )
        )

    db.commit()
