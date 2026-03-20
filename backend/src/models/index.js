const User = require('./User');
const Member = require('./Member');
const Payment = require('./Payment');
const ExtraRecord = require('./ExtraRecord');
const ExtraRecordMember = require('./ExtraRecordMember'); // <--- ADICIONE ESTE

// ... (outras associações)

// 3. RELACIONAMENTO: EXTRA_RECORD <-> MEMBER (N:N) CORRIGIDO
ExtraRecord.belongsToMany(Member, { 
  through: ExtraRecordMember, // <--- USE O MODELO AQUI, NÃO A STRING
  as: 'participants', 
  foreignKey: 'extra_record_id',
  otherKey: 'member_id'
});

Member.belongsToMany(ExtraRecord, { 
  through: ExtraRecordMember, // <--- USE O MODELO AQUI
  as: 'extra_records', 
  foreignKey: 'member_id',
  otherKey: 'extra_record_id'
});

module.exports = {
  User,
  Member,
  Payment,
  ExtraRecord,
  ExtraRecordMember // Exportar também
};