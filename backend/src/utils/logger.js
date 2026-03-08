// src/utils/logger.js
// Se você ainda não criou o Model 'AuditLog', vamos usar o banco direto
const db = require('../config/database'); 

async function createLog(userId, userName, action, description, req) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Query pura para garantir que funcione independente do Model estar pronto
    const query = `
      INSERT INTO audit_logs (user_id, user_name, action, description, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    // Se você estiver usando Sequelize:
    await db.query(query, {
      replacements: [userId, userName, action, description, ip]
    });

    console.log(`[AUDIT]: ${action} por ${userName}`);
  } catch (err) {
    console.error('[LOGGER ERROR]: Falha ao gravar log de auditoria', err);
  }
}

module.exports = { createLog };