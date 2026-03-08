const { DataTypes } = require('sequelize');
const { sequelize: db } = require('../config/database'); 

const ExtraRecordMember = db.define('ExtraRecordMember', {}, { 
  tableName: 'extra_record_members',
  timestamps: false,
  underscored: true
});

module.exports = ExtraRecordMember;