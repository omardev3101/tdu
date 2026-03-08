require('dotenv').config();
const { sequelize } = require('./src/config/database');
const User = require('./src/models/User'); // Importe o modelo individualmente

async function runSeed() {
  try {
    await sequelize.authenticate();
    console.log('📡 Conectado para semear dados...');

    // 1. Remove o admin antigo para garantir que o hash novo funcione
    await User.destroy({ where: { email: 'admin@tdu7caveiras.com.br' } });

    // 2. Cria o novo admin
    // Usamos 'password' (virtual) para que o hook beforeSave no User.js gere o hash
    await User.create({
      name: 'Omar Rodrigues',
      email: 'admin@tdu7caveiras.com.br',
      password: '123456', 
      role: 'DIRETOR'
    });

    console.log('✅ Usuário Administrador (Re)criado!');
    process.exit();
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

runSeed();