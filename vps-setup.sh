#!/bin/bash

# --- CONFIGURAÇÕES ---
REPO_URL="https://github.com/omardev3101/tdu.git"
DEST_DIR="/var/www/7caveiras"

echo "🛠️ Preparando o VPS via Git para o TDU 7 Caveiras..."

# 1. Atualização e Git
apt-get update
apt-get install -y git curl apt-transport-https ca-certificates software-properties-common

# 2. Instalação do Docker
echo "📦 Instalando Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-get install -y docker-ce

# 3. Instalação do Docker Compose
echo "🐳 Instalando Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. Clonar Repositório
echo "📡 Clonando repositório em $DEST_DIR..."
mkdir -p /var/www
if [ -d "$DEST_DIR" ]; then
    echo "⚠️ Diretório já existe. Fazendo pull..."
    cd $DEST_DIR && git pull
else
    git clone $REPO_URL $DEST_DIR
fi

echo "✅ Ambiente VPS preparado! Agora basta configurar o Nginx e rodar o deploy."
