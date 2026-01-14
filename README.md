# Status Shop Backend (NestJS)

Путь: `d:\Status_Shop_Nest\backend`

## Быстрый старт (Docker)

```bash
cd backend
docker compose up -d --build
```

При старте контейнера API автоматически выполнит `prisma db push` и `prisma db seed`.

API: `http://localhost:3000/api`

Swagger: `http://localhost:3000/api/docs`

## Локальный старт (без Docker)

1) Запустить Postgres с базой `status_shop`.

2) В `backend/.env`:
- `DATABASE_URL="postgresql://postgres:%3F%40K9fGZ8@localhost:5432/status_shop?schema=public"`

3) Команды:

```bash
npm i
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

## Сидирование данных

- Скрипт: `prisma/seed.ts`
- Он создаёт категории/товары/филиалы на основе данных, ранее захардкоженных во Flutter.
