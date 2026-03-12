const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Member = sequelize.define('Member', {
  // --- Dados Pessoais ---
  full_name: { 
    type: DataTypes.STRING, 
    allowNull: false
  },
  photo_url: { 
    type: DataTypes.STRING, // Alterado para STRING para salvar o nome do arquivo
    allowNull: true
  },
  gender: { 
    type: DataTypes.STRING(50),
    defaultValue: 'Não Informado'
  },
  document_cpf: { 
    type: DataTypes.STRING(14), 
    unique: true,
    allowNull: true
  },
  document_rg: { 
    type: DataTypes.STRING(20),
    allowNull: true
  },
  rg_emissor: { 
    type: DataTypes.STRING(20),
    allowNull: true
  },
  phone_whatsapp: { 
    type: DataTypes.STRING(20),
    allowNull: true
  },
  birth_date: { 
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  email: { 
    type: DataTypes.STRING, 
    unique: true,
    allowNull: true
  },
  password_hash: { 
    type: DataTypes.STRING,
    allowNull: true
  },

  // --- Endereço ---
  address_zip: {
    type: DataTypes.STRING(10)
  },
  address_street: {
    type: DataTypes.STRING(255)
  },
  address_number: {
    type: DataTypes.STRING(10)
  },
  address_complement: {
    type: DataTypes.STRING(100)
  },
  address_district: {
    type: DataTypes.STRING(100)
  },
  address_city: {
    type: DataTypes.STRING(100),
    defaultValue: 'Diadema'
  },

  // --- Dados Religiosos ---
  category: { 
    type: DataTypes.ENUM('Corrente', 'Assistência', 'Ogã', 'Cambone', 'Pai de Pequeno', 'Mãe de Pequena'),
    defaultValue: 'Corrente' 
  },
  status: {
    type: DataTypes.STRING(20), 
    defaultValue: 'Pendente'
  },
  baptism_date: { 
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  godparent: { 
    type: DataTypes.STRING
  },
  previous_house: { 
    type: DataTypes.STRING
  },

  // --- Dados Eleitorais / Políticos ---
  is_voter: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false
  },
  voter_card: { 
    type: DataTypes.STRING
  },
  voter_zone: { 
    type: DataTypes.STRING
  },
  voter_section: { 
    type: DataTypes.STRING
  },
  political_note: { 
    type: DataTypes.TEXT
  },

  // --- Financeiro ---
  balance_retroactive: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  custom_contribution: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 100.00
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