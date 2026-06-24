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

A-запись домена → IP VPS. Подождите до 24 ч propagation.

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

```bash
export DOMAIN=daniluhov.ru
export CERTBOT_EMAIL=ya@daniluhov.ru
./scripts/init-ssl.sh

# Создайте SSL-конфиг из шаблона
cp docker/nginx/conf.d/site.ssl.conf.example docker/nginx/conf.d/site.conf
sed -i "s/DOMAIN/$DOMAIN/g" docker/nginx/conf.d/site.conf

docker compose -f docker-compose.prod.yml restart nginx
```

## Обновление сайта

```bash
./scripts/deploy.sh
```

Или с локальной машины:

```bash
ssh user@VPS 'cd /opt/danilmakes && ./scripts/deploy.sh'
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

### GitHub недоступен

Деплой не зависит от GitHub Actions — используйте `deploy.sh` по SSH.

### Письма не приходят

- Проверьте пароль приложения (не основной пароль)
- Логи API: `docker compose -f docker-compose.prod.yml logs api`
- Заявки всё равно в БД: `docker compose -f docker-compose.prod.yml exec postgres psql -U danilmakes -c 'SELECT * FROM contact_requests;'`

## Оптимизация под 1 GB RAM

PostgreSQL в `docker-compose.prod.yml` уже с `shared_buffers=64MB`. Не запускайте лишние сервисы на том же VPS.
