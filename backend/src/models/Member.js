const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Member = sequelize.define('Member', {
  // --- Dados Pessoais ---
  full_name: { 
    type: DataTypes.STRING, 
    allowNull: false,
    field: 'full_name' // Mapeia fullName do JS para full_name do DB
  },
  photo_url: { type: DataTypes.STRING },
  document_cpf: { 
    type: DataTypes.STRING, 
    unique: true,
    field: 'document_cpf'
  },
  document_rg: { 
    type: DataTypes.STRING,
    field: 'document_rg' 
  },
  phone_whatsapp: { 
    type: DataTypes.STRING,
    field: 'phone_whatsapp'
  },
  birth_date: { 
    type: DataTypes.DATEONLY,
    field: 'birth_date'
  },
  email: { type: DataTypes.STRING, unique: true },
  password_hash: { type: DataTypes.STRING },

  // --- Dados Religiosos ---
  category: { 
    type: DataTypes.ENUM('Corrente', 'Assistência', 'Ogã', 'Cambone', 'Pai de Pequeno', 'Mãe de Pequena'),
    defaultValue: 'Corrente' 
  },
  status: { 
    type: DataTypes.ENUM('Ativo', 'Inativo', 'Suspenso'),
    defaultValue: 'Ativo' 
  },
  baptism_date: { 
    type: DataTypes.DATEONLY,
    field: 'baptism_date'
  },
  godparent: { type: DataTypes.STRING },

  // --- Dados Eleitorais / Políticos ---
  is_voter: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false,
    field: 'is_voter'
  },
  is_not_voter: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false,
    field: 'is_not_voter' // Campo novo para menores de 16
  },
  voter_card: { 
    type: DataTypes.STRING,
    field: 'voter_card'
  },
  voter_zone: { 
    type: DataTypes.STRING,
    field: 'voter_zone'
  },
  voter_section: { 
    type: DataTypes.STRING,
    field: 'voter_section' // Campo novo que separamos
  },
  political_note: { 
    type: DataTypes.TEXT,
    field: 'political_note'
  },

  // --- Financeiro ---
  balance_retroactive: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'balance_retroactive'
  },
  custom_contribution: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 100.00,
    field: 'custom_contribution'
  },

  // --- Controle de Sistema ---
  role: { 
    type: DataTypes.ENUM('member', 'moderator', 'admin'),
    defaultValue: 'member' 
  }
}, {
  tableName: 'members', // Garante que o Sequelize use o nome exato da tabela
  timestamps: true,
  underscored: true // Converte automaticamente createdAt para created_at
});

module.exports = Member;