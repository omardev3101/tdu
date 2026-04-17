#!/bin/bash

# --- CONFIGURAÇÕES ---
DEST_DIR="/var/www/7caveiras"
API_URL="http://187.45.255.59/7caveiras/api"

echo "🔄 Iniciando Atualização Remota (Git Pull) - TDU 7 Caveiras"

cd $DEST_DIR

# 1. Puxar últimas mudanças
echo "📡 Buscando novidades no GitHub..."
git pull origin main

# 2. Rebuild dos containers
echo "🏗️ Reconstruindo containers com a nova API_URL..."
docker-compose down
docker-compose build --build-arg VITE_API_URL=$API_URL
docker-compose up -d

echo "--------------------------------------------------------"
echo "✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"
echo "🌐 URL: http://187.45.255.59/7caveiras/"
echo "--------------------------------------------------------"
