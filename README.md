# Status Shop Backend

Backend под Flutter-приложение `frontend/`.

Стек: NestJS + PostgreSQL + Prisma + Docker, JWT авторизация, Swagger.

## Быстрый старт (Docker)

1) Создай `backend/.env` по примеру `.env.example` и укажи `POSTGRES_PASSWORD`.

```bash
docker compose up --build
```

После старта:

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/docs`

Миграции/сиды (внутри контейнера или локально):

```bash
npm run prisma:migrate:dev
npm run seed
```

## Запуск локально (без Docker)

1) Создай `.env` по примеру `.env.example`.
2) Убедись, что PostgreSQL запущен и база называется `status_shop`.
3) Укажи корректный `DATABASE_URL` (обычно `localhost:5432`).

```bash
npm install
npm run prisma:generate
npm run start:dev
```

## Переменные окружения

- `DATABASE_URL` — строка подключения к Postgres (рекомендуется `connection_limit=10`).
- `JWT_ACCESS_SECRET` — секрет для access токенов.
- `JWT_ACCESS_TTL` — срок жизни access токена.
- `CORS_ORIGIN` — список origin через запятую, без `*` для prod.
- `REDIS_URL` — URL Redis для кеша.
- `CACHE_TTL` — TTL кеша в секундах.
- `THROTTLE_TTL` — окно rate limit в секундах.
- `THROTTLE_LIMIT` — лимит запросов на окно.

## Основные эндпоинты

- Auth: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- Users: `GET /api/v1/users/me`, `PATCH /api/v1/users/me`
- Catalog: `GET /api/v1/categories`, `GET /api/v1/products`, `GET /api/v1/products/:id`
- Cart: `GET /api/v1/cart`, `POST /api/v1/cart/items`, `PATCH /api/v1/cart/items/:id`, `DELETE /api/v1/cart/items/:id`
- Orders: `POST /api/v1/orders/checkout`, `GET /api/v1/orders/my`, `GET /api/v1/orders/:id`, `PATCH /api/v1/orders/:id/cancel`
- Shops: `GET /api/v1/shops`
- Support: `GET /api/v1/support/thread`, `GET /api/v1/support/messages`, `POST /api/v1/support/messages`

## Роли и доступы (заготовка под админку)

Роли в базе: `USER`, `MANAGER`, `BRANCH_DIRECTOR`, `OWNER` (и `ADMIN` как совместимость, трактуется как `OWNER`).

- `OWNER`: полный доступ ко всем админским эндпоинтам.
- `BRANCH_DIRECTOR`: админский доступ к заказам/чату + доступ к своему филиалу (shopId).
- `MANAGER`: админский доступ только к заказам и чату.

Админские эндпоинты (JWT):

- Catalog admin (только `OWNER`): `GET/POST/PATCH/DELETE /api/v1/admin/categories`, `GET/POST/PATCH/DELETE /api/v1/admin/products`, управление картинками через `/api/v1/admin/products/:id/images` и `/api/v1/admin/product-images/:id`
- Shops admin: `GET/PATCH /api/v1/admin/shops` (директор видит только свой shop), `POST/DELETE /api/v1/admin/shops` (только `OWNER`)
- Orders admin (минимальная роль `MANAGER`): `GET /api/v1/admin/orders`, `GET /api/v1/admin/orders/:id`, `PATCH /api/v1/admin/orders/:id/status`
- Support admin (минимальная роль `MANAGER`): `GET /api/v1/admin/support/threads`, `GET /api/v1/admin/support/threads/:id`, `POST /api/v1/admin/support/threads/:id/messages`, `PATCH /api/v1/admin/support/threads/:id/close`
- Users admin (только `OWNER`): `GET/POST/PATCH/DELETE /api/v1/admin/users` (DELETE = деактивация)

## Формат ответов

- Все ответы обёрнуты в `{ data: ... }`.
- Для списков используется `{ data: [...], meta: { page, limit, total, totalPages } }`.

## Пагинация

Поддерживается в админских списках и в публичном списке товаров:

- `page` — номер страницы (по умолчанию 1)
- `limit` — размер страницы (по умолчанию 20, максимум 100)

## Миграция с Firebase

Смотри [frontend-mapping.md](docs/frontend-mapping.md).
