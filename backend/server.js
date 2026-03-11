require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('./src/config/database');
const routes = require('./src/routes');

// --- BLOCO DE DEBUG (MANTIDO) ---
console.log('--- [DEBUG AMBIENTE] ---');
const indexPath = path.join(__dirname, 'src', 'models', 'index.js');
try {
    const models = require(indexPath);
    console.log('Modelos Encontrados:', Object.keys(models));
} catch (e) {
    console.log('⚠️ Aviso: Models index não carregado via debug, mas o app tentará seguir.');
}

const app = express();

// --- MIDDLEWARES ---
app.use(cors()); // Render/Docker exigem CORS habilitado para o Frontend conectar
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Garante que a pasta de uploads existe no container
const uploadPath = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
app.use('/uploads', express.static(uploadPath));

// Health Check (Essencial para o Render saber que o App está ON)
app.get('/health', (req, res) => res.status(200).send('OK'));

// Rotas
app.use(routes);

const PORT = process.env.PORT || 3000;

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão MySQL Banco Externo: OK');

    // Em produção, "alter: true" é seguro, mas cuidado com dados críticos.
    await sequelize.sync({ alter: true });
    console.log('✅ Sincronização de Tabelas: OK');

    // ESCUTA EM 0.0.0.0 PARA DOCKER/RENDER
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TDU - 7 CAVEIRAS ONLINE NA PORTA ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro crítico na inicialização:', error);
    process.exit(1); // Força o container a reiniciar em caso de erro de conexão
  }
}

run();