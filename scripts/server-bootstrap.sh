#!/usr/bin/env bash
set -euo pipefail

# First-time VPS setup for danilmakes (Ubuntu 24.04)
# Run as root: bash scripts/server-bootstrap.sh

if [[ $EUID -ne 0 ]]; then
    echo "Run as root"
    exit 1
fi

echo "==> System update..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq

echo "==> Swap 2G (recommended for 1GB RAM)..."
if ! swapon --show | grep -q '/swapfile'; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Docker..."
if ! command -v docker >/dev/null; then
    curl -fsSL https://get.docker.com | sh
fi
systemctl enable docker
systemctl start docker

echo "==> Node.js 20 (for frontend build)..."
if ! command -v node >/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs git
fi

echo "==> UFW..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo "==> Project directory..."
mkdir -p /opt/danilmakes

echo "==> Bootstrap complete."
docker --version
node --version
npm --version
