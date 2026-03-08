const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Member = require('./Member');

const Contribution = sequelize.define('Contribution', {
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'members', key: 'id' },
    field: 'member_id'
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
  notes: { type: DataTypes.TEXT }
}, {
  tableName: 'contributions',
  underscored: true,
  timestamps: true
});

Member.hasMany(Contribution, { foreignKey: 'memberId', as: 'contributions' });
Contribution.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

module.exports = Contribution;