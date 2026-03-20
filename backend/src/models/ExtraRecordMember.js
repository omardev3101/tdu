const { DataTypes } = require('sequelize');
const { sequelize: db } = require('../config/database');

const ExtraRecordMember = db.define('ExtraRecordMember', {
  extra_record_id: {
    type: DataTypes.INTEGER,
    references: { model: 'extra_records', key: 'id' }
  },
  member_id: {
    type: DataTypes.INTEGER,
    references: { model: 'members', key: 'id' }
  }
}, { 
  tableName: 'extra_record_members', // Nome exato da tabela no seu MySQL
  timestamps: false 
});

module.exports = ExtraRecordMember;