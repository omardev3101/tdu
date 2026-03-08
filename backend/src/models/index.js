// src/models/index.js
const User = require('./User');
const Member = require('./Member');
const Payment = require('./Payment');
const ExtraRecord = require('./ExtraRecord');

// --- VERIFICAÇÃO DE INICIALIZAÇÃO ---
console.log('--- Inicializando Associações do Sistema ---');

// 1. RELACIONAMENTO: USER <-> MEMBER (1:1)
User.hasOne(Member, { foreignKey: 'user_id', as: 'member' });
Member.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 2. RELACIONAMENTO: MEMBER <-> PAYMENT (1:N)
Member.hasMany(Payment, { foreignKey: 'member_id', as: 'payments' });
Payment.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

// 3. RELACIONAMENTO: EXTRA_RECORD <-> MEMBER (N:N)
// Usamos o "through" com o nome da tabela intermediária 'extra_record_members'
ExtraRecord.belongsToMany(Member, { 
  through: 'extra_record_members', 
  as: 'participants', 
  foreignKey: 'extra_record_id',
  otherKey: 'member_id'
});

Member.belongsToMany(ExtraRecord, { 
  through: 'extra_record_members', 
  as: 'extra_records', 
  foreignKey: 'member_id',
  otherKey: 'extra_record_id'
});

// --- EXPORTAÇÃO DOS MODELOS ---
// Certifique-se de importar este arquivo no seu server.js ou na inicialização do DB
module.exports = {
  User,
  Member,
  Payment,
  ExtraRecord
};