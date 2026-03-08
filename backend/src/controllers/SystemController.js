const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const connection = require('../config/database'); // Ajuste para seu caminho de conexão
const { createLog } = require('../utils/logger'); // A função utilitária que criamos

class SystemController {
  // Gerar e baixar Backup
  async generateBackup(req, res) {
    const { id: userId, name: userName } = req.user;
    const fileName = `backup_tdu_${Date.now()}.sql`;
    const tempDir = path.resolve(__dirname, '..', '..', 'temp');
    const filePath = path.join(tempDir, fileName);

    try {
      // 1. Garantir que o diretório temporário existe
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // 2. Comando do dump
      const command = `mysqldump -u ${process.env.DB_USER} -p${process.env.DB_PASS} ${process.env.DB_NAME} > "${filePath}"`;

      exec(command, async (error) => {
        if (error) {
          console.error('Erro no processamento do Backup:', error);
          return res.status(500).json({ error: 'Erro interno ao processar dump.' });
        }

        // 3. Registrar o Log de Auditoria
        await createLog(
          userId, 
          userName, 
          'BACKUP_DOWNLOAD', 
          `O Diretor realizou a extração completa da base de dados: ${fileName}`, 
          req
        );

        // 4. Enviar arquivo e limpar após conclusão
        res.download(filePath, fileName, (err) => {
          if (err) console.error('Erro no envio do arquivo:', err);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      });
    } catch (err) {
      return res.status(500).json({ error: 'Erro sistêmico ao gerar backup.' });
    }
  }

  // Listar todos os logs para o seu Dashboard de Auditoria
  async getLogs(req, res) {
    try {
      // Retorna os últimos 100 logs para não sobrecarregar o frontend
      const logs = await connection('audit_logs')
        .select('*')
        .orderBy('created_at', 'desc')
        .limit(100);

      return res.json(logs);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar logs de auditoria.' });
    }
  }
}

module.exports = new SystemController();