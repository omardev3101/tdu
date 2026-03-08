const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Payment = sequelize.define('Payment', {
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  dueDate: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('Pendente', 'Pago', 'Vencido'), defaultValue: 'Pendente' },
  type: { type: DataTypes.ENUM('Mensalidade', 'Trabalho Extra', 'Doação'), allowNull: false }
});

module.exports = Payment;