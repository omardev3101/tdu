# --- CONFIGURAÇÕES ---
$USER = "root"
$IP = "187.45.255.59"
$DEST_DIR = "/var/www/7caveiras"

Write-Host "🚀 Iniciando Deploy via PM2 para VPS - TDU 7 Caveiras" -ForegroundColor Cyan

# 1. Garantir que as mudanças locais foram commitadas e enviadas
Write-Host "📡 Enviando mudanças para o GitHub..." -ForegroundColor Yellow
git add .
git commit -m "chore: update before deploy"
git push origin main

# 2. Transferir o script de atualização (opcional, se já estiver lá)
Write-Host "📡 Sincronizando script de atualização..." -ForegroundColor Yellow
C:\Windows\System32\OpenSSH\scp.exe update-pm2.sh "$USER@$IP`:$DEST_DIR/"

# 3. Executar comando remoto
Write-Host "🏗️ Executando atualização remota no Linux..." -ForegroundColor Yellow
C:\Windows\System32\OpenSSH\ssh.exe "$USER@$IP" "chmod +x $DEST_DIR/update-pm2.sh; $DEST_DIR/update-pm2.sh"

Write-Host "--------------------------------------------------------" -ForegroundColor Green
Write-Host "✅ PROCESSO DE DEPLOY FINALIZADO!" -ForegroundColor Green
Write-Host "🌐 Verifique em: http://$IP/7caveiras/" -ForegroundColor Green
Write-Host "--------------------------------------------------------"
