// src/models/ExtraRecord.js
const { DataTypes } = require('sequelize');
const { sequelize: db } = require('../config/database');

const ExtraRecord = db.define('ExtraRecord', {
  type: {
    type: DataTypes.ENUM('Doação', 'Trabalho Extra'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'extra_records',
  underscored: true
});

// Exporte APENAS o modelo principal. 
// O Sequelize criará a tabela intermediária automaticamente se declararmos no index.js
module.exports = ExtraRecord;