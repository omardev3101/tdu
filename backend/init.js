const fs = require('fs');
const path = require('path');

const folders = [
  'src/config',
  'src/models',
  'src/controllers',
  'src/routes',
  'src/middlewares'
];

const files = {
  '.env': 'DB_HOST=localhost\nDB_USER=root\nDB_PASS=suasenha\nDB_NAME=tdu_7caveiras\nPORT=3000\nJWT_SECRET=secret_7_caveiras',
  
  'src/config/database.js': `const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASS, 
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

module.exports = sequelize;`,

  'src/models/Member.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Member = sequelize.define('Member', {
  fullName: { type: DataTypes.STRING(150), allowNull: false },
  photoUrl: DataTypes.STRING,
  documentCpf: { type: DataTypes.STRING(14), unique: true },
  category: { 
    type: DataTypes.ENUM('Corrente', 'Assistência', 'Ogã', 'Cambone'), 
    allowNull: false 
  },
  status: { 
    type: DataTypes.ENUM('Ativo', 'Inativo', 'Suspenso'), 
    defaultValue: 'Ativo' 
  },
  baptismDate: DataTypes.DATEONLY,
  entryDate: DataTypes.DATEONLY,
  phoneWhatsapp: DataTypes.STRING(20)
});

module.exports = Member;`,

  'server.js': `const express = require('express');
const sequelize = require('./src/config/database');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  console.log('Banco de dados MySQL conectado e sincronizado.');
  app.listen(PORT, () => console.log('Servidor rodando na porta ' + PORT));
}).catch(err => console.log('Erro ao conectar ao banco:', err));`
};

// Criacao das pastas
folders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log('Pasta criada:', folder);
  }
});

// Criacao dos arquivos
Object.entries(files).forEach(([filePath, content]) => {
  fs.writeFileSync(path.join(__dirname, filePath), content);
  console.log('Arquivo criado:', filePath);
});

console.log('\nEstrutura do TDU-7Caveiras pronta!');