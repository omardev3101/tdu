const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Member = require('./Member');

const Contribution = sequelize.define('Contribution', {
  member_id: { // ou memberId
  type: DataTypes.INTEGER,
  allowNull: false,
  field: 'member_id', // <--- Isso garante que o SQL use o nome certo
  references: { model: 'members', key: 'id' }
},
  description: { type: DataTypes.STRING, allowNull: false },
  value: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // Valor a pagar acordado
  originalValue: { 
    type: DataTypes.DECIMAL(10, 2), 
    defaultValue: 100.00,
    field: 'original_value'
  },
  residualValue: { 
    type: DataTypes.DECIMAL(10, 2), 
    defaultValue: 0.00,
    field: 'residual_value'
  },
  notes: { type: DataTypes.TEXT },
  dueDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'due_date' },
  paymentDate: { type: DataTypes.DATEONLY, field: 'payment_date' },
  status: { 
    type: DataTypes.ENUM('Pendente', 'Pago', 'Atrasado', 'Isento'), 
    defaultValue: 'Pendente' 
  },
  paymentMethod: { 
    type: DataTypes.ENUM('Dinheiro', 'Pix', 'Cartão', 'Transferência'),
    field: 'payment_method'
  },
  agreementId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'agreement_id',
    references: { model: 'agreements', key: 'id' }
  },
  type: {
    type: DataTypes.ENUM('Mensalidade', 'Acordo', 'Outros'),
    defaultValue: 'Mensalidade'
  },
  
  notes: { type: DataTypes.TEXT }
}, {
  tableName: 'contributions',
  underscored: true,
  timestamps: true
});

Member.hasMany(Contribution, { foreignKey: 'memberId', as: 'contributions' });
Contribution.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });
const Agreement = require('./Agreement'); // Importe o novo model
Agreement.hasMany(Contribution, { foreignKey: 'agreementId', as: 'installments' });
Contribution.belongsTo(Agreement, { foreignKey: 'agreementId', as: 'agreement' });

module.exports = Contribution;