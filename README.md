# danilmakes

Личный сайт-визитка: портфолио, кейсы, контактная форма, backend для заявок с уведомлениями на почту.

**Live:** [danilmakes.ru](https://danilmakes.ru)

> Интерактивные демо (`/demo/*`) — экспериментальные; для proof of skill опираться на тексты кейсов и код основной визитки.

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
| `npm run build:tariff-prices` | Сборка демо «Цены и ограничения» в `public/tariffPrices/` |
| `npm run build:report-revenue` | Сборка демо «Отчёт по доходу» в `public/reportRevenue/` |
| `npm run build:divisions` | Сборка демо Divisions в `public/divisions/` |
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
demos/         — исходники демо (сборка в public/)
```

## Деплой на VPS

Основной способ: пуш в `master` → GitHub Actions гоняет `scripts/rsync-deploy.sh` (секреты `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`). Подробно: [docs/DEPLOY.md](docs/DEPLOY.md).

Локально, без GitHub: `./scripts/rsync-deploy.sh user@your-host` (хост и ключ — в локальном окружении / секретах, не в README).

## Контент

- Текст главной: `src/pages/AboutMe/ui/AboutMe.tsx`
- Контакты на сайте: `src/shared/consts/contact.ts`
- Портфолио в меню: `src/widgets/AppHeader/ui/AppHeader.tsx`, `src/app/codeExamples/index.ts`

## Roadmap

- [docs/ROADMAP.md](docs/ROADMAP.md) — статус фаз
- [docs/SPEC-BACKLOG.md](docs/SPEC-BACKLOG.md) — детальная спека доработок (для реализации в отдельных задачах)
