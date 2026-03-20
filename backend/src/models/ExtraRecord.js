const { DataTypes } = require('sequelize');
const { sequelize: db } = require('../config/database'); 

const ExtraRecord = db.define('ExtraRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('Doação', 'Trabalho Extra'),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // O CAMPO QUE VOCÊ ESTÁ ADICIONANDO:
  external_donor: { 
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'extra_records',
  underscored: true, // Isso garante que o Sequelize busque created_at e updated_at
  timestamps: true
});

module.exports = ExtraRecord;