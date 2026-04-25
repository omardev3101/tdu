#!/bin/bash

# --- CONFIGURAÇÕES ---
DEST_DIR="/var/www/7caveiras"
API_URL="https://pessistemas.vps-kinghost.net/7caveiras/api"

echo "🔄 Iniciando Atualização Remota (PM2) - TDU 7 Caveiras"

cd $DEST_DIR

# 1. Ajustes de ambiente (Carregar NVM ou PATH se necessário)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

# Corrigir erro de permissão do Git
git config --global --add safe.directory /var/www/7caveiras

# 2. Puxar últimas mudanças
echo "📡 Buscando novidades no GitHub..."
git fetch origin main
git reset --hard origin/main

# 3. Atualizar Backend
echo "📦 Atualizando Backend..."
cd backend
npm install
# Tenta reiniciar ou inicia se não existir (Injetando a porta via env)
pm2 restart tdu-backend || PORT=3005 pm2 start server.js --name tdu-backend
cd ..

# 4. Atualizar Frontend
echo "📦 Atualizando Frontend..."
cd frontend
npm install
# Injetando a URL da API no build do Vite
VITE_API_URL=$API_URL npm run build

# O Frontend geralmente é servido de forma estática pelo Nginx
# Se quiser usar o PM2 para garantir que algo rode na porta 5180:
pm2 restart tdu-frontend || pm2 serve dist 5180 --name tdu-frontend --spa

cd ..

echo "--------------------------------------------------------"
echo "✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"
echo "🌐 URL: http://187.45.255.59/7caveiras/"
echo "--------------------------------------------------------"
