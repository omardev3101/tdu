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

// Middlewares
const authMiddleware = require('./middlewares/auth');
const checkRole = require('./middlewares/checkRole');

// Importar o Model para as rotas que usam Member diretamente (ou use o Controller se preferir)
const Member = require('./models/Member'); 

const routes = new Router();
const upload = multer(multerConfig);

// ==========================================
// --- 1. ROTAS PÚBLICAS (Sem Token) ---
// ==========================================

routes.post('/sessions', SessionController.store);

// Rota para preenchimento externo (Filhos da Casa)
// MOVIA PARA CÁ: Antes do Middleware de Autenticação
routes.post('/public/solicitacao', async (req, res) => {
    try {
        const data = req.body;
        const novaSolicitacao = await Member.create({
            full_name: data.full_name,
            photo_url: data.photo_url,
            document_cpf: data.document_cpf,
            document_rg: data.document_rg,
            phone_whatsapp: data.phone_whatsapp,
            birth_date: data.birth_date,
            email: data.email,
            category: data.category || 'Corrente',
            baptism_date: data.baptism_date,
            godparent: data.godparent,
            is_voter: data.is_voter,
            is_not_voter: data.is_not_voter,
            voter_card: data.voter_card,
            voter_zone: data.voter_zone,
            voter_section: data.voter_section,
            political_note: data.political_note,

            // Segurança
            status: 'Pendente', 
            role: 'member',
            balance_retroactive: 0.00,
            custom_contribution: 100.00,
            // Certifique-se de que hashPassword esteja definido ou importe um utilitário de hash
            password_hash: data.password ? data.password : null 
        });

        res.status(201).json({ 
            success: true, 
            message: 'Cadastro enviado com sucesso! Aguarde a aprovação da diretoria.' 
        });
    } catch (error) {
        console.error("Erro na solicitação:", error);
        res.status(500).json({ success: false, message: 'Erro ao enviar dados.' });
    }
});

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

routes.get('/members/:id', MemberController.show);
routes.post('/members', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), upload.single('photo'), MemberController.store);
routes.put('/members/:id', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), upload.single('photo'), MemberController.update);
routes.delete('/members/:id', checkRole(['DIRETOR']), MemberController.delete);

routes.get('/contributions', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA', 'TESOUREIRO']), ContributionController.index);
routes.post('/contributions/generate', checkRole(['DIRETOR', 'TESOUREIRO']), ContributionController.generateMonthly);
routes.put('/contributions/:id/pay', checkRole(['DIRETOR', 'TESOUREIRO']), ContributionController.pay);

// --- ROTA CRÍTICA: Apenas o Diretor Máximo ou Tecnologia ---
routes.delete('/contributions/reset', checkRole(['DIRETOR', 'DIRETOR DE TECNOLOGIA']), ContributionController.truncate);

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