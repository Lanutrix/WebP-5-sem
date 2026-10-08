# Лабораторная работа №4 — FastAPI + React

Клиент-серверное приложение «Зелёный Берег»: REST API на FastAPI (SQLite) и React-фронт
на базе ЛР3 с регистрацией, калькулятором услуг, корзиной, заявками, статусами и админ-панелью.

## Структура

```
lab4/
├── backend/
│   ├── main.py              # точка входа FastAPI, CORS, роутеры
│   ├── requirements.txt
│   └── app/
│       ├── database.py      # SQLAlchemy + SQLite (app.db)
│       ├── models.py        # User, Service, Order, OrderItem, OrderStatusHistory
│       ├── schemas.py       # Pydantic-схемы (валидация / JSON)
│       ├── auth.py          # bcrypt + JWT, зависимости доступа
│       ├── seed.py          # прайс услуг + администратор
│       └── routers/         # auth, services, orders, admin
└── frontend/
    └── src/
        ├── api/client.js    # Fetch-обёртка, Bearer-токен
        ├── context/         # AuthContext, CartContext
        ├── pages/           # Calculator, Cart, Orders, Track, Admin, Login, Register…
        └── components/      # OrderCard, StatusBadge, RequireAuth, Header…
```

## Запуск

Бэкенд (порт 8000):

```bash
cd lab4/backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Фронтенд (порт 5173, `/api` проксируется на бэкенд):

```bash
cd lab4/frontend
npm install
npm run dev
```

Swagger: http://127.0.0.1:8000/docs

Демо-администратор: `admin@zelenybereg.ru` / `admin12345` (создаётся при первом старте).

## API

| Метод | Путь | Доступ | Назначение |
|-------|------|--------|------------|
| POST | `/api/auth/register` | все | регистрация, возвращает JWT |
| POST | `/api/auth/login` | все | вход |
| GET | `/api/auth/me` | user | профиль |
| GET | `/api/services` | все | прайс (для калькулятора) |
| POST / PUT / DELETE | `/api/services[/{id}]` | admin | CRUD услуг |
| POST | `/api/orders` | гость / user | создать заявку из корзины |
| GET | `/api/orders/my` | user | история заявок |
| GET | `/api/orders/track?code=&email=` | все | трекинг гостя |
| GET | `/api/admin/orders?status=` | admin | все заявки |
| PATCH | `/api/admin/orders/{id}/status` | admin | `new → paid → in_progress → completed` / `cancelled` |
| DELETE | `/api/admin/orders/{id}` | admin | удалить заявку |
| GET | `/api/admin/stats` | admin | сводка |

Каждая смена статуса пишется в `order_status_history` и отображается клиенту
в кабинете (`/orders`) или на странице трекинга (`/track`).

## Автор

Одинцов Д. М., группа КТбо3-5.
