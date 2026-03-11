const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Member = require('./Member');

const Agreement = sequelize.define('Agreement', {
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'members', key: 'id' }
  },
  totalValue: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false,
    field: 'total_value'
  },
  installmentsCount: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'installments_count'
  },
  status: { 
    type: DataTypes.ENUM('Pendente', 'Ativo', 'Cancelado', 'Finalizado'), 
    defaultValue: 'Pendente' 
  },
  termsAccepted: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false,
    field: 'terms_accepted'
  },
  signedAt: { 
    type: DataTypes.DATE, 
    field: 'signed_at' 
  }
}, {
  tableName: 'agreements',
  underscored: true,
  timestamps: true
});

// Relacionamentos
Member.hasMany(Agreement, { foreignKey: 'member_id', as: 'agreements' });
Agreement.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

module.exports = Agreement;