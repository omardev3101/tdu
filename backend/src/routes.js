const { Router } = require('express');
const multer = require('multer');
const multerConfig = require('./config/multer');

// Controllers
const SessionController = require('./controllers/SessionController');
const MemberController = require('./controllers/MemberController');
const ContributionController = require('./controllers/ContributionController');
const EventController = require('./controllers/EventController');
const SystemController = require('./controllers/SystemController');
const ExtraRecordController = require('./controllers/ExtraRecordController');
const AgreementController = require('./controllers/AgreementController');

// Middlewares
const authMiddleware = require('./middlewares/auth');
const checkRole = require('./middlewares/checkRole');

// Models (para rotas inline)
const Member = require('./models/Member'); 

const routes = new Router();
const upload = multer(multerConfig);

// ==========================================
// --- 1. ROTAS PÚBLICAS (Sem Token) ---
// ==========================================

routes.post('/sessions', SessionController.store);
routes.get('/health', (req, res) => res.status(200).send('OK'));

// Alistamento externo (Filhos da Casa)
routes.post(
  '/public/solicitacao', 
  upload.single('photo_url'), 
  (req, res, next) => {
    if (!req.body.full_name || !req.body.birth_date) {
      return res.status(400).json({ error: "Nome e Data de Nascimento são obrigatórios." });
    }
    next();
  }, 
  MemberController.store
);

// Rota pública para validação de QR Code/Membro
routes.get('/public/membro/:id', MemberController.show);

// ==========================================
// --- 2. MIDDLEWARE DE AUTENTICAÇÃO ---
// ==========================================
// A partir daqui, todas as rotas exigem Token JWT
routes.use(authMiddleware);

// ==========================================
// --- 3. SEÇÃO: MEMBROS (GESTÃO E ADMIN) ---
// ==========================================

// Listagem e Operações CRUD
routes.get('/admin/members', MemberController.index);
routes.get('/admin/members/:id', MemberController.show);
routes.post('/admin/members', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), upload.single('photo_url'), MemberController.store);
routes.put('/admin/members/:id', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), upload.single('photo_url'), MemberController.update);
routes.delete('/admin/members/:id', checkRole(['DIRETOR']), MemberController.delete);

// Fluxo de Aprovação de Solicitações
routes.get('/admin/solicitacoes-pendentes', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), async (req, res) => {
    try {
        const pendentes = await Member.findAll({
            where: { status: 'Pendente' },
            order: [['created_at', 'DESC']]
        });
        res.json(pendentes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar solicitações.' });
    }
});

routes.put('/admin/aprovar/:id', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), async (req, res) => {
    try {
        const { id } = req.params;
        const membro = await Member.findByPk(id);
        if (!membro) return res.status(404).json({ message: 'Membro não encontrado' });
        membro.status = 'Ativo';
        await membro.save();
        res.json({ success: true, message: `${membro.full_name} aprovado!` });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao aprovar.' });
    }
});

routes.delete('/admin/descartar/:id', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), async (req, res) => {
    try {
        const { id } = req.params;
        const membro = await Member.findByPk(id);
        if (!membro) return res.status(404).json({ message: 'Solicitação não encontrada' });
        if (membro.status !== 'Pendente') {
            return res.status(403).json({ message: 'Não é possível descartar um membro já ativo.' });
        }
        await membro.destroy();
        res.json({ success: true, message: 'Solicitação descartada com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao descartar solicitação.' });
    }
});

// Configurações Adicionais de Membro
routes.put('/admin/configurar-membro/:id', MemberController.updateConfig);

// ==========================================
// --- 4. SEÇÃO: FINANCEIRO (MENSALIDADES) ---
// ==========================================

routes.get('/admin/stats', checkRole(['DIRETOR', 'TESOUREIRO']), ContributionController.getStats);
routes.get('/contributions', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA', 'TESOUREIRO']), ContributionController.index);
routes.post('/contributions/generate', checkRole(['DIRETOR', 'TESOUREIRO']), ContributionController.generateMonthly);
routes.put('/contributions/:id/pay', checkRole(['DIRETOR', 'TESOUREIRO']), ContributionController.pay);

// Reset Financeiro (CUIDADO)
routes.delete('/contributions/reset', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), ContributionController.truncate);

// ==========================================
// --- 5. SEÇÃO: ACORDOS E TERMOS ---
// ==========================================

routes.get('/agreements', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA', 'TESOUREIRO']), AgreementController.index);
routes.post('/agreements', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA', 'TESOUREIRO']), AgreementController.create);
routes.put('/agreements/:id/accept', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA', 'TESOUREIRO']), AgreementController.acceptTerms);

// ==========================================
// --- 6. SEÇÃO: EVENTOS E AGENDA ---
// ==========================================

routes.get('/events', EventController.index);
routes.post('/events', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), EventController.store);

// ==========================================
// --- 7. SEÇÃO: REGISTROS EXTRAS (OUVIDORIA) ---
// ==========================================

routes.get('/extra-records', ExtraRecordController.index);
routes.post('/extra-records', ExtraRecordController.store);
routes.delete('/extra-records/:id', ExtraRecordController.delete);

// ==========================================
// --- 8. SEÇÃO: SISTEMA E AUDITORIA ---
// ==========================================

routes.get('/system/backup-download', checkRole(['DIRETOR DE TECNOLOGIA', 'DIRETOR']), SystemController.generateBackup);
routes.get('/system/logs', checkRole(['DIRETOR DE TECNOLOGIA']), SystemController.getLogs);

module.exports = routes;