const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');


const ExtraRecord = sequelize.define('ExtraRecord', {
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
  external_donor: { // <--- ADICIONE ESTE CAMPO AQUI
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'extra_records',
  underscored: true, // Garante o uso de created_at e updated_at
});

module.exports = ExtraRecord;