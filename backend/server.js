require('dotenv').config();
const express = require('express');
const cors = require('cors'); // 1. Importe o CORS
const {sequelize} = require('./src/config/database');
const routes = require('./src/routes');

// --- BLOCO DE DEBUG CRÍTICO ---
console.log('--- [DEBUG ABSOLUTO] ---');
const path = require('path');
const indexPath = path.join(__dirname, 'src', 'models', 'index.js');

console.log('Procurando arquivo em:', indexPath);

if (require.resolve(indexPath)) {
    const models = require(indexPath);
    console.log('Conteúdo Bruto do index:', models);
    console.log('Modelos Encontrados:', Object.keys(models));
} else {
    console.log('❌ Arquivo index.js não foi localizado no caminho acima.');
}
// ------------------------------

const app = express();
app.use(cors({
  origin: '*', // Importante para testes em rede local
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

app.use(routes);
const PORT = process.env.PORT || 3000;

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão MySQL: OK');

    // Aqui o Sequelize tentará criar as tabelas se encontrar os modelos
    await sequelize.sync({ force: true });
    console.log('✅ Sincronização concluída.');

    app.listen(PORT, () => console.log('🚀 TESTE DE SALVAMENTO: 7 CAVEIRAS'));
  } catch (error) {
    console.error('❌ Falha no Sync:', error);
  }
}

run();