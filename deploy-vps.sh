#!/bin/bash

# --- CONFIGURAÇÕES ---
USER="root"
IP="187.45.255.59"
PASS="Omar3101@"
DEST_DIR="/var/www/7caveiras"
API_URL="http://187.45.255.59/7caveiras/api"

echo "🚀 Iniciando Deploy para VPS - TDU 7 Caveiras"

# 1. Preparar arquivos locais (excluir node_modules e .git)
echo "📦 Compactando arquivos para transferência..."
tar -czf project.tar.gz --exclude='node_modules' --exclude='.git' --exclude='project.tar.gz' .

# 2. Transferir para o VPS (usando sshpass para automação com senha)
# Se não tiver 'sshpass' instalado localmente, você pode fazer manualmente.
if command -v sshpass &> /dev/null; then
    echo "📡 Transferindo arquivos para $IP..."
    sshpass -p "$PASS" scp project.tar.gz $USER@$IP:$DEST_DIR/
    
    echo "🏗️  Executando deploy remoto..."
    sshpass -p "$PASS" ssh $USER@$IP << EOF
        cd $DEST_DIR
        tar -xzf project.tar.gz
        rm project.tar.gz
        
        # Build e Up
        docker-compose down
        docker-compose build --no-cache --build-arg VITE_API_URL=$API_URL
        docker-compose up -d
        
        echo "✅ Deploy remoto concluído!"
EOF
else
    echo "⚠️ 'sshpass' não encontrado. Por favor, transfira o arquivo 'project.tar.gz' manualmente para $DEST_DIR no VPS e execute o docker-compose lá."
fi

echo "--------------------------------------------------------"
echo "🌐 URL do Sistema: http://$IP/7caveiras/"
echo "--------------------------------------------------------"
