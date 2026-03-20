const User = require('./User');
const Member = require('./Member');
const Payment = require('./Payment');
const ExtraRecord = require('./ExtraRecord');
const ExtraRecordMember = require('./ExtraRecordMember');

// --- INICIALIZAÇÃO DAS ASSOCIAÇÕES ---

// 1. RELACIONAMENTO: USER <-> MEMBER (1:1)
User.hasOne(Member, { foreignKey: 'user_id', as: 'member' });
Member.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 2. RELACIONAMENTO: MEMBER <-> PAYMENT (1:N)
Member.hasMany(Payment, { foreignKey: 'member_id', as: 'payments' });
Payment.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

// 3. RELACIONAMENTO: EXTRA_RECORD <-> MEMBER (N:N)
// Lado do Registro (Para buscar quem participou da doação/trabalho)
ExtraRecord.belongsToMany(Member, { 
  through: ExtraRecordMember, 
  as: 'participants', 
  foreignKey: 'extra_record_id',
  otherKey: 'member_id'
});

// Lado do Membro (Para buscar o histórico de extras de um filho da casa)
Member.belongsToMany(ExtraRecord, { 
  through: ExtraRecordMember, 
  as: 'member_extra_records', // Apelido ÚNICO para evitar o erro de duplicidade
  foreignKey: 'member_id',
  otherKey: 'extra_record_id'
});

// --- EXPORTAÇÃO ---
module.exports = {
  User,
  Member,
  Payment,
  ExtraRecord,
  ExtraRecordMember
};