const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Agendado para rodar todo dia às 03:00 da manhã
cron.schedule('0 3 * * *', () => {
  const fileName = `tdu_backup_${new Date().toISOString().split('T')[0]}.sql`;
  const backupPath = path.resolve(__dirname, '..', '..', 'backups', fileName);

  // Exemplo para MySQL (Ajuste para seu banco se for Oracle)
  const command = `mysqldump -u ${process.env.DB_USER} -p${process.env.DB_PASS} ${process.env.DB_NAME} > ${backupPath}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`[BACKUP ERROR]: ${error.message}`);
      return;
    }
    console.log(`[BACKUP SUCCESS]: Arquivo ${fileName} gerado com sucesso.`);
    
    // Opcional: Aqui você pode disparar um e-mail ou log de sucesso
  });
});