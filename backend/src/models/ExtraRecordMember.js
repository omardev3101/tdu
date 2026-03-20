const { DataTypes } = require('sequelize');
const { sequelize: db } = require('../config/database'); 

const ExtraRecordMember = db.define('ExtraRecordMember', {
  // Definimos explicitamente para o Sequelize não tentar "adivinhar"
  extra_record_id: {
    type: DataTypes.INTEGER,
    primaryKey: true, // Se for uma tabela de ligação, os dois juntos são a chave
    allowNull: false
  },
  member_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  }
}, { 
  tableName: 'extra_record_members',
  timestamps: false,
  underscored: true
});

module.exports = ExtraRecordMember;