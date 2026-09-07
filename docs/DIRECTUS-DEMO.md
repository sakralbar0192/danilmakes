# Directus CMS — демо на danilmakes.ru

Облегчённый self-hosted Directus (SQLite) рядом с личным сайтом. Фронт `/artStudio/` читает контент из API.

## Статус: frozen

По умолчанию **выключен**, чтобы не занимать ~400 MB RAM на VPS.

- Compose-профиль: `art-studio` (сервис `directus` не стартует без профиля)
- Nginx отдаёт `503` на `/artStudio/`, `/cms/`, `/p/art-studio/`
- Volumes (`directus-database`, uploads, extensions) **сохраняются**

### Разморозить на VPS

```bash
cd /opt/danilmakes   # или путь к репо
docker compose -f docker-compose.prod.yml --profile art-studio up -d directus

# Вернуть nginx-прокси к Directus: скопируйте блок upstream directus +
# location /artStudio/, /cms/, auth_request из git-истории / docs ниже,
# либо восстановите из бэкапа site.conf и reload nginx.
```

В `site.ssl.conf.example` замороженные location’ы помечены комментарием; при unfreeze верните `upstream directus` и auth_request-прокси как раньше.

### Заморозить снова

```bash
docker compose -f docker-compose.prod.yml stop directus
# или: docker compose -f docker-compose.prod.yml --profile art-studio stop directus
docker compose -f docker-compose.prod.yml up -d nginx   # без профиля — Directus не поднимется
```

---

## Доступ (когда разморожено)

1. Пароль превью: https://danilmakes.ru/p/art-studio/
2. Сайт: https://danilmakes.ru/artStudio/
3. CMS: https://danilmakes.ru/cms/admin

Логин Directus — `DIRECTUS_ADMIN_EMAIL` / `DIRECTUS_ADMIN_PASSWORD` в `.env` на VPS.

## Что править в админке

| Коллекция | На сайте |
| --- | --- |
| **Hero** | Первый экран (можно оставить название Hero) |
| **Бренд** (`site_settings`) | Логотип |
| **Запись** (`trial`) | Тексты блока записи на пробное |
| **Контакты** (`contacts`) | Заголовок, телефон, VK, адрес, часы, отзывы |
| **Галерея** (`gallery`) | Лента на главной (`eyebrow`/`title`) + тексты страницы галереи (`page_*`) + работы (`items`) |
| **Занятия** (`schedule_section`) | Чему учим (чипы) + группы и расписание |
| **Студия** (`atmosphere`) | Атмосфера + педагог |
| **Цены** (`pricing`) | Заголовки + тарифы (поле `items`) |

## Изображения — рекомендации размеров

Подсказки также видны в note полей Directus.

| Место | Соотношение | Размер | Вес |
| --- | --- | --- | --- |
| Логотип | 1:1 | 512×512 | ≤200 КБ |
| Hero-заголовок PNG | ~2.5:1 | ~1200×480 | ≤300 КБ |
| Hero фото 1 | 4:5 | 800×1000 | ≤350 КБ |
| Hero фото 2 | 1:1 | 800×800 | ≤300 КБ |
| Hero фото 3 | 5:4 | 1000×800 | ≤350 КБ |
| Атмосфера (большое) | 3:4 | 900×1200 | ≤400 КБ |
| Атмосфера (бок) | ~4:5 | 800×1000 | ≤350 КБ |
| Педагог | 4:5 | 800×1000 | ≤400 КБ |
| Расписание (мини) | 1:1 | 600×600 | ≤200 КБ |
| Галерея | вертик. предпочт. | длинная сторона 1200–1600 | ≤450 КБ |

Формат: JPEG (фото), PNG (лого/титул с прозрачностью), WebP ок.

Расширение схемы (hero/atmosphere/directions):

```bash
DIRECTUS_URL=http://127.0.0.1:8055 \
ART_STUDIO_ASSETS=/opt/danilmakes/public/artStudio \
npm run directus:extend-art-studio
```

Вынести hero из Site Settings (миграция на существующей БД):

```bash
DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:split-hero
```

Схлопнуть телефон / скрыть directions_* в Site Settings:

```bash
DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:cleanup-settings
```

Вынести заголовки секций (расписание / цены / работы / пробное):

```bash
DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:split-sections
```

Вынести контакты и подписать «Запись» / «Контакты»:

```bash
DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:split-contacts
```

Объединить заголовки с контентом в JSON-поля и удалить `schedule_groups` / `prices`:

```bash
DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:flatten-sections
```

## Схема и сиды текстов

На VPS (Directus слушает `127.0.0.1:8055`):

```bash
cd /opt/danilmakes
set -a && source .env && set +a
DIRECTUS_URL=http://127.0.0.1:8055 npm run directus:setup-art-studio
DIRECTUS_URL=http://127.0.0.1:8055 ART_STUDIO_ASSETS=/opt/danilmakes/public/artStudio npm run directus:media-art-studio
```

Скрипт текстов идемпотентен для коллекций; списки prices/schedule/gallery при повторном `setup` перезаписываются.

## Ресурсы

- **По умолчанию frozen** (см. выше) — контейнер не запущен
- Лимит контейнера при unfreeze: **400 MB RAM**
- SQLite, без Redis
- `/cms/` закрыт тем же cookie, что и `/artStudio/` (когда разморожено)

## Деплой фронта

```bash
npm run sync:art-studio
./scripts/rsync-deploy.sh
```
