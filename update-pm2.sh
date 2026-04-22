#!/bin/bash

# --- CONFIGURAÇÕES ---
DEST_DIR="/var/www/7caveiras"
API_URL="http://187.45.255.59/7caveiras/api"

echo "🔄 Iniciando Atualização Remota (PM2) - TDU 7 Caveiras"

cd $DEST_DIR

# 1. Puxar últimas mudanças
echo "📡 Buscando novidades no GitHub..."
git pull origin main

# 2. Atualizar Backend
echo "📦 Atualizando Backend..."
cd backend
npm install
# Tenta reiniciar pelo nome 'tdu-backend', se falhar reinicia tudo
pm2 restart tdu-backend || pm2 restart all
cd ..

# 3. Atualizar Frontend
echo "📦 Atualizando Frontend..."
cd frontend
npm install
# Injetando a URL da API no build do Vite
VITE_API_URL=$API_URL npm run build

# O Frontend geralmente é servido de forma estática pelo Nginx
# Mas se estiver usando PM2 para servir (porta 5180):
pm2 restart tdu-frontend || echo "⚠️ Frontend não está no PM2 ou usa outro nome. Verifique o Nginx."

cd ..

echo "--------------------------------------------------------"
echo "✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"
echo "🌐 URL: http://187.45.255.59/7caveiras/"
echo "--------------------------------------------------------"
