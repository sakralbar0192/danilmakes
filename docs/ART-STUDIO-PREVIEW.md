# Закрытый пример изостудии «Мама, я рисую»

> **Статус:** frozen на проде (Directus не запущен, nginx → 503). См. [DIRECTUS-DEMO.md](./DIRECTUS-DEMO.md).

## Для заказчика

1. Ссылка (открывает только поле пароля): **https://danilmakes.ru/p/art-studio/**
2. Пароль — из `docker/nginx/htpasswd/artstudio.credentials` (или `.env`: `ART_STUDIO_PREVIEW_PASSWORD`)

Логин не нужен: ссылка уже «привязана» к этому превью.

После верного пароля ставится HttpOnly-cookie, и открывается `/artStudio/`.  
Прямые ссылки на фото без cookie nginx не отдаёт (проверка `auth_request`).

## Как устроено

| Часть | Роль |
| --- | --- |
| `/p/art-studio/` | Публичная страница только с полем «Пароль» |
| `POST /api/preview/art-studio/unlock` | Сверяет пароль, ставит cookie |
| `GET /api/preview/art-studio/auth` | Internal для nginx `auth_request` |
| `/artStudio/*` | Статика превью, только с валидной cookie |

## Env на VPS (`.env`)

```bash
ART_STUDIO_PREVIEW_PASSWORD=секрет_для_заказчика
ART_STUDIO_PREVIEW_SECRET=отдельный_секрет_для_подписи_cookie
```

`ART_STUDIO_PREVIEW_SECRET` желательно задать отдельно (если нет — для подписи используется пароль).

## Обновить вёрстку превью

```bash
npm run sync:art-studio
```

## Деплой

1. Прописать пароль в `.env` на сервере  
2. В активном `site.conf` — блоки `__auth_art_studio` / `/artStudio/` из `site.ssl.conf.example`  
3. `npm run build` + перезапуск `api` и `nginx`

Локально (`npm run dev`) `/artStudio/` без nginx не закрыт — защита работает на проде.
