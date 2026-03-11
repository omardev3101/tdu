const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Member = sequelize.define('Member', {
  // --- Dados Pessoais ---
  full_name: { 
    type: DataTypes.STRING, 
    allowNull: false,
    field: 'full_name' 
  },
  photo_url: { 
    type: DataTypes.TEXT('long'), // Alterado para TEXT('long') caso salve Base64, ou STRING se salvar caminho
    field: 'photo_url'
  },
  gender: { 
    type: DataTypes.STRING(50),
    field: 'gender'
  },
  document_cpf: { 
    type: DataTypes.STRING(14), 
    unique: true,
    field: 'document_cpf'
  },
  document_rg: { 
    type: DataTypes.STRING(20),
    field: 'document_rg' 
  },
  rg_emissor: { 
    type: DataTypes.STRING(20),
    field: 'rg_emissor'
  },
  phone_whatsapp: { 
    type: DataTypes.STRING(20),
    field: 'phone_whatsapp'
  },
  birth_date: { 
    type: DataTypes.DATEONLY,
    field: 'birth_date'
  },
  email: { 
    type: DataTypes.STRING, 
    unique: true 
  },
  password_hash: { 
    type: DataTypes.STRING,
    field: 'password_hash'
  },

  // --- Endereço ---
  address_zip: {
    type: DataTypes.STRING(10),
    field: 'address_zip'
  },
  address_street: {
    type: DataTypes.STRING(255),
    field: 'address_street'
  },
  address_number: {
    type: DataTypes.STRING(10),
    field: 'address_number'
  },
  address_complement: {
    type: DataTypes.STRING(100),
    field: 'address_complement'
  },
  address_district: {
    type: DataTypes.STRING(100),
    field: 'address_district'
  },
  address_city: {
    type: DataTypes.STRING(100),
    defaultValue: 'Diadema',
    field: 'address_city'
  },

  // --- Dados Religiosos ---
  category: { 
    type: DataTypes.ENUM('Corrente', 'Assistência', 'Ogã', 'Cambone', 'Pai de Pequeno', 'Mãe de Pequena'),
    defaultValue: 'Corrente' 
  },
  status: {
    type: DataTypes.STRING(20), 
    defaultValue: 'Pendente',
    field: 'status'
  },
  baptism_date: { 
    type: DataTypes.DATEONLY,
    field: 'baptism_date'
  },
  godparent: { 
    type: DataTypes.STRING,
    field: 'godparent'
  },
  previous_house: { // Campo extra para histórico espiritual
    type: DataTypes.STRING,
    field: 'previous_house'
  },

  // --- Dados Eleitorais / Políticos ---
  is_voter: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false,
    field: 'is_voter'
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
    field: 'voter_section'
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
  tableName: 'members', 
  timestamps: true,
  underscored: true 
});

module.exports = Member;