const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./src/config/database');

const app = express();

// Middlewares essenciais
app.use(cors());
app.use(express.json());

// Rota de teste (Health Check) - Importante para o Render saber que o app está vivo
app.get('/', (req, res) => {
  res.json({ status: 'Servidor TDU Online', timestamp: new Date() });
});

// Importação de Rotas (Exemplo)
// const agreementRoutes = require('./src/routes/agreementRoutes');
// app.use(agreementRoutes);

const PORT = process.env.PORT || 3000;

// Sincronização e Start
async function startServer() {
  try {
    // Tenta autenticar a conexão primeiro
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco externo estabelecida com sucesso.');

    // No Docker/Produção, evite usar .sync({ force: true }) para não apagar dados.
    // O comando de migrate no Dockerfile cuidará das tabelas.
    await sequelize.sync(); 
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco externo:', err);
    process.exit(1); // Encerra o container para o Render tentar reiniciar
  }
}

startServer();