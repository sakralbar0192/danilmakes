# danilmakes

Личный сайт-визитка разработчика. Портфолио, контактная форма, backend для приёма заявок с уведомлениями на почту.

## Стек

- **Frontend:** React 18, TypeScript, Vite, Redux Toolkit, Bootstrap
- **Backend:** Node.js, Express, PostgreSQL, Nodemailer (Яндекс SMTP)
- **Инфраструктура:** Docker Compose, nginx, Let's Encrypt

## Быстрый старт (локально)

```bash
nvm use
npm ci
cp .env.example .env   # заполните SMTP и пароль БД

# Backend + PostgreSQL
docker compose up -d

# Frontend
npm run dev
```

Сайт: http://localhost:5173  
API: http://localhost:3000/api/health

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Vite dev server с proxy `/api` |
| `npm run build` | Сборка frontend в `dist/` |
| `npm run lint` | ESLint |
| `npm run preview` | Просмотр production-сборки |

Backend (`server/`):

| Команда | Описание |
|---------|----------|
| `npm run dev` | API с hot reload |
| `npm run migrate` | Применить миграции |

## Структура проекта

```
src/           — React SPA (FSD: app, pages, widgets, entities, shared)
server/        — Express API
docker/        — конфиги nginx
scripts/       — deploy.sh, init-ssl.sh, backup-db.sh
docs/          — архитектура, деплой, roadmap
public/        — статические демо-проекты портфолио
```

## Деплой на VPS

Основной способ — `scripts/deploy.sh` на сервере. Подробно: [docs/DEPLOY.md](docs/DEPLOY.md).

Опционально: GitHub Actions (`.github/workflows/deploy-vps.yml`) при настройке Secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

## Контент

- Текст главной: `src/pages/AboutMe/ui/AboutMe.tsx`
- Контакты на сайте: `src/shared/consts/contact.ts`
- Портфолио в меню: `src/widgets/AppHeader/ui/AppHeader.tsx`, `src/app/codeExamples/index.ts`

## Roadmap

- [docs/ROADMAP.md](docs/ROADMAP.md) — статус фаз
- [docs/SPEC-BACKLOG.md](docs/SPEC-BACKLOG.md) — детальная спека доработок (для реализации в отдельных задачах)
