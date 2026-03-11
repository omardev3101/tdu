#!/bin/bash

# --- CONFIGURAÇÕES ---
BACKEND_PORT=3000
FRONTEND_PORT=5173
# Se estiver na nuvem, troque o IP pela URL oficial (ex: https://api.tdu.com)
API_URL="http://192.168.1.9:$BACKEND_PORT"

echo "🚀 Iniciando Deploy Automatizado - TDU 7 Caveiras"

# 1. Limpeza de Containers antigos
echo "🧹 Removendo containers antigos..."
docker-compose down

# 2. Build das Imagens com injeção de variáveis
echo "🏗️  Buildando as imagens (isso pode demorar na primeira vez)..."
docker-compose build --build-arg VITE_API_URL=$API_URL

# 3. Subida dos serviços
echo "🆙 Subindo os serviços..."
docker-compose up -d

echo "--------------------------------------------------------"
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "📡 Backend: $API_URL"
echo "🌐 Frontend: http://localhost:$FRONTEND_PORT"
echo "--------------------------------------------------------"
echo "📝 Dica: Use 'docker-compose logs -f' para ver os logs em tempo real."