# Деплой на VPS

## Требования

| Параметр | Минимум | Рекомендация |
|----------|---------|--------------|
| CPU | 1 vCPU | Cloud NSK 15 (1×3.3 ГГц) |
| RAM | 1 GB | + swap 1–2 GB |
| Диск | 15 GB SSD | NVMe |
| ОС | Ubuntu 22.04 / 24.04 | |

## Подготовка сервера (один раз)

```bash
# Обновление
sudo apt update && sudo apt upgrade -y

# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Swap (важно для 1 GB RAM)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Проект
sudo mkdir -p /opt/danilmakes
sudo chown $USER:$USER /opt/danilmakes
git clone git@github.com:sakralbar0192/danilmakes.git /opt/danilmakes
cd /opt/danilmakes
cp .env.example .env
nano .env   # заполните все значения
```

## Настройка Яндекс SMTP

1. [Яндекс ID](https://id.yandex.ru) → Безопасность → **Пароли приложений**
2. Создайте пароль для «Почта»
3. В `.env`:

```
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=vodoley0192@yandex.ru
SMTP_PASS=<пароль приложения>
NOTIFY_EMAIL=ya@daniluhov.ru
```

## DNS

Домен: **danilmakes.ru** → **109.71.242.7**

| Запись | Тип | Значение |
|--------|-----|----------|
| `@` | A | `109.71.242.7` |
| `www` | A | `109.71.242.7` |

Проверка: `dig +short danilmakes.ru` — должен вернуть IP. Propagation: до 24–48 ч.

Пока DNS не работает, сайт доступен по **http://109.71.242.7**. В `.env` на сервере временно: `CORS_ORIGIN=http://109.71.242.7`.

## Первый деплой

Сервер: **109.71.242.7** (Timeweb Cloud NSK 15, Ubuntu 24.04).

```bash
# С локальной машины (без git push):
./scripts/rsync-deploy.sh root@109.71.242.7
```

Или вручную на сервере:
cd /opt/danilmakes
chmod +x scripts/*.sh

# Сборка frontend
npm ci && npm run build

# Запуск (HTTP)
docker compose -f docker-compose.prod.yml up -d --build
```

Проверка: `curl http://YOUR_IP/api/health`

## SSL (Let's Encrypt)

**Только после того, как `dig +short danilmakes.ru` вернёт IP сервера.**

```bash
export DOMAIN=danilmakes.ru
export CERTBOT_EMAIL=ya@daniluhov.ru
./scripts/init-ssl.sh
```

Скрипт запросит сертификат для `danilmakes.ru` и `www`, создаст `site.conf`, отключит `site.http.conf` и перезапустит nginx.

Перед SSL обновите `.env` на сервере:

```
DOMAIN=danilmakes.ru
CORS_ORIGIN=https://danilmakes.ru
```

После смены `CORS_ORIGIN` пересоздайте API: `docker compose -f docker-compose.prod.yml up -d --force-recreate api`

## Обновление сайта

**Обычный путь:** пуш в `master`. GitHub Actions (`.github/workflows/deploy-vps.yml`) синкает репозиторий на VPS тем же `rsync-deploy.sh` и запускает сборку.

Нужны Secrets репозитория: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

Локально, без ожидания Actions:

```bash
./scripts/rsync-deploy.sh root@109.71.242.7
```

Только сборка на уже синхронизированном сервере:

```bash
ssh root@109.71.242.7 'cd /opt/danilmakes && ./scripts/deploy.sh'
```

## Бэкапы БД

```bash
./scripts/backup-db.sh
```

Добавьте в cron (ежедневно в 3:00):

```
0 3 * * * cd /opt/danilmakes && ./scripts/backup-db.sh
```

## Troubleshooting

### nginx 502 на /api

```bash
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml ps
```

### Ошибки миграции

```bash
docker compose -f docker-compose.prod.yml exec api node dist/db/migrate.js
```

### npm timeout при сборке

```bash
npm config set fetch-retries 5
npm ci
```

### GitHub Actions не деплоит

Проверьте Secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` и вкладку Actions. Пока workflow недоступен — локально `./scripts/rsync-deploy.sh`.

### Письма не приходят

- Проверьте пароль приложения (не основной пароль)
- Логи API: `docker compose -f docker-compose.prod.yml logs api`
- Заявки всё равно в БД: `docker compose -f docker-compose.prod.yml exec postgres psql -U danilmakes -c 'SELECT * FROM contact_requests;'`

## Оптимизация под 1 GB RAM

PostgreSQL в `docker-compose.prod.yml` уже с `shared_buffers=64MB`. Не запускайте лишние сервисы на том же VPS.
