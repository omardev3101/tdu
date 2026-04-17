# --- CONFIGURAÇÕES ---
$USER = "root"
$IP = "187.45.255.59"
$DEST_DIR = "/var/www/7caveiras"
$API_URL = "http://187.45.255.59/7caveiras/api"

Write-Host "🚀 Iniciando Deploy para VPS (Windows PowerShell) - TDU 7 Caveiras" -ForegroundColor Cyan

# 1. Compactar arquivos (Usando o tar nativo do Windows 10/11)
Write-Host "📦 Compactando arquivos..." -ForegroundColor Yellow
if (Test-Path "project.tar.gz") { Remove-Item "project.tar.gz" }
tar -czf project.tar.gz --exclude='node_modules' --exclude='.git' --exclude='project.tar.gz' .

# 2. Transferir para o VPS
Write-Host "📡 Transferindo arquivos para $IP..." -ForegroundColor Yellow
scp project.tar.gz "$USER@$IP`:$DEST_DIR/"

# 3. Executar comandos remotos
Write-Host "🏗️ Executando deploy remoto no Linux..." -ForegroundColor Yellow
ssh "$USER@$IP" "cd $DEST_DIR; tar -xzf project.tar.gz; rm project.tar.gz; docker-compose down; docker-compose build --no-cache --build-arg VITE_API_URL=$API_URL; docker-compose up -d"

Write-Host "--------------------------------------------------------" -ForegroundColor Green
Write-Host "✅ DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "🌐 URL: http://$IP/7caveiras/" -ForegroundColor Green
Write-Host "--------------------------------------------------------"
