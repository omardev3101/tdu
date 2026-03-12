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
const controller = require('./controllers/MemberController'); // Importa o controlador para as rotas de configuração
const AgreementController = require('./controllers/AgreementController'); // Importa o controlador de acordos

// Middlewares
const authMiddleware = require('./middlewares/auth');
const checkRole = require('./middlewares/checkRole');

const Member = require('./models/Member'); 
console.log('MemberController:', Object.keys(MemberController));
console.log('ContributionController:', Object.keys(ContributionController));
console.log('EventController:', EventController ? Object.keys(EventController) : 'Não importado');
const routes = new Router();
const upload = multer(multerConfig);

// ==========================================
// --- 1. ROTAS PÚBLICAS (Sem Token) ---
// ==========================================

routes.post('/sessions', SessionController.store);

// Rota para preenchimento externo (Filhos da Casa)
// CORRIGIDO: de 'router.post' para 'routes.post'
// Remova aquela primeira rota 'async (req, res)' inteira e mantenha apenas esta:

routes.post(
  '/public/solicitacao', 
  upload.single('photo_url'), // 1. O Multer processa a foto e preenche o req.body
  (req, res, next) => {   // 2. Middleware de validação simples
    if (!req.body.full_name || !req.body.birth_date) {
      return res.status(400).json({ 
        error: "Nome e Data de Nascimento são obrigatórios." 
      });
    }
    next();
  }, 
  MemberController.store  // 3. O Controller salva tudo no banco
);
// ==========================================
// --- 2. MIDDLEWARE DE AUTENTICAÇÃO ---
// ==========================================
routes.use(authMiddleware);

// ==========================================
// --- 3. ROTAS PRIVADAS (Requer Login) ---
// ==========================================

/**
 * MÓDULO DE MEMBROS E APROVAÇÕES
 */
routes.get('/members', MemberController.index);

// Listar solicitações pendentes (Diretoria)
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

// Aprovar membro
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

// Descartar/Deletar solicitação pendente
routes.delete('/admin/descartar/:id', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), async (req, res) => {
    try {
        const { id } = req.params;
        const membro = await Member.findByPk(id);

        if (!membro) return res.status(404).json({ message: 'Solicitação não encontrada' });
        
        // Segurança: Só permite deletar se o status for Pendente
        if (membro.status !== 'Pendente') {
            return res.status(403).json({ message: 'Não é possível descartar um membro já ativo.' });
        }

        await membro.destroy();
        res.json({ success: true, message: 'Solicitação descartada com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao descartar solicitação.' });
    }
});

routes.get('/admin/stats', checkRole(['DIRETOR', 'TESOUREIRO']), ContributionController.getStats);

routes.get('/admin/membro/:id', MemberController.show); 
routes.put('/admin/configurar-membro/:id', MemberController.updateConfig);

routes.get('/members/:id', MemberController.show);
routes.post('/members', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), upload.single('photo'), MemberController.store);
routes.put('/members/:id', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), upload.single('photo'), MemberController.update);
routes.delete('/members/:id', checkRole(['DIRETOR']), MemberController.delete);

routes.get('/contributions', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA', 'TESOUREIRO']), ContributionController.index);
routes.post('/contributions/generate', checkRole(['DIRETOR', 'TESOUREIRO']), ContributionController.generateMonthly);
routes.put('/contributions/:id/pay', checkRole(['DIRETOR', 'TESOUREIRO']), ContributionController.pay);

// --- ROTA CRÍTICA: Apenas o Diretor Máximo ou Tecnologia ---
routes.delete('/contributions/reset', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), ContributionController.truncate);

routes.get('/agreements',checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA', 'TESOUREIRO']), AgreementController.index); // LISTAR ACORDOS
routes.post('/agreements',checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA', 'TESOUREIRO']), AgreementController.create); // CRIAR NOVO
routes.put('/agreements/:id/accept', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA', 'TESOUREIRO']), AgreementController.acceptTerms); // ACEITAR TERMO
/**
 * MÓDULO DE EVENTOS / AGENDA
 */
routes.get('/events', EventController.index);
routes.post('/events', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), EventController.store);

/**
 * MÓDULO DE SISTEMA E AUDITORIA
 * Acesso Exclusivo: Direção de Tecnologia
 */
routes.get('/system/backup-download', checkRole(['DIRETOR DE TECNOLOGIA', 'DIRETOR']), SystemController.generateBackup);
routes.get('/system/logs', checkRole(['DIRETOR DE TECNOLOGIA']), SystemController.getLogs);

routes.get('/extra-records', ExtraRecordController.index);
routes.post('/extra-records', ExtraRecordController.store);
routes.delete('/extra-records/:id', ExtraRecordController.delete);
module.exports = routes;