const Contribution = require('../models/Contribution');
const Member = require('../models/Member');
const { Op } = require('sequelize');

module.exports = {
  /**
   * GERA MENSALIDADES PARA TODOS OS MEMBROS ATIVOS
   */
  async generateMonthly(req, res) {
    try {
      const { month, year } = req.body;
      const DEFAULT_VALUE = 100.00;

      if (!month || !year) {
        return res.status(400).json({ error: 'Mês e ano são obrigatórios.' });
      }

      // Descrição formatada (Ex: Mensalidade 03/2026)
      const description = `Mensalidade ${String(month).padStart(2, '0')}/${year}`;
      
      // Data de Vencimento padrão: dia 20 do mês/ano selecionado
      const dueDate = `${year}-${String(month).padStart(2, '0')}-20`;

      // Busca apenas membros com status 'Ativo'
      const activeMembers = await Member.findAll({ where: { status: 'Ativo' } });

      if (activeMembers.length === 0) {
        return res.status(404).json({ error: 'Nenhum membro ativo encontrado.' });
      }

      const contributionsData = [];

      for (const member of activeMembers) {
        // Verifica se já existe mensalidade com essa descrição para o membro
        // Importante: use o nome do campo conforme definido no seu Model (memberId ou member_id)
        const alreadyExists = await Contribution.findOne({ 
          where: { 
            memberId: member.id, 
            description 
          } 
        });

        if (!alreadyExists) {
          // BLINDAGEM CONTRA NaN:
          // Se custom_contribution for nulo, undefined ou string vazia, assume o DEFAULT_VALUE
          const rawValue = member.custom_contribution;
          let agreedValue = (rawValue !== null && rawValue !== undefined && rawValue !== '') 
            ? parseFloat(rawValue) 
            : DEFAULT_VALUE;

          // Validação final: se o parse resultou em NaN por erro de digitação no banco
          if (isNaN(agreedValue)) {
            agreedValue = DEFAULT_VALUE;
          }

          const residual = DEFAULT_VALUE - agreedValue;

          contributionsData.push({
            memberId: member.id, // Certifique-on de que no Model está 'memberId'
            description,
            value: agreedValue,
            originalValue: DEFAULT_VALUE,
            residualValue: residual > 0 ? residual : 0,
            dueDate,
            status: agreedValue === 0 ? 'Isento' : 'Pendente',
            notes: 'Geração automática via sistema'
          });
        }
      }

      if (contributionsData.length === 0) {
        return res.status(400).json({ 
          error: 'As mensalidades deste período já foram geradas para todos os membros ativos.' 
        });
      }

      // Inserção em massa para performance
      await Contribution.bulkCreate(contributionsData);

      return res.json({ 
        message: `${contributionsData.length} mensalidades geradas com sucesso!` 
      });

    } catch (err) {
      console.error("❌ ERRO NA GERAÇÃO:", err);
      return res.status(500).json({ 
        error: 'Erro ao gerar mensalidades.', 
        details: err.message 
      });
    }
  },

  /**
   * LISTA TODAS AS CONTRIBUIÇÕES COM DADOS DO MEMBRO
   */
  async index(req, res) {
    try {
      const contributions = await Contribution.findAll({
        include: [{ 
          model: Member, 
          as: 'member', // Deve ser o mesmo 'as' definido no seu arquivo de associacoes/models
          attributes: ['full_name', 'category', 'custom_contribution'] 
        }],
        order: [
          ['dueDate', 'DESC'],
          [{ model: Member, as: 'member' }, 'full_name', 'ASC']
        ]
      });
      return res.json(contributions);
    } catch (err) {
      console.error("❌ ERRO NO INDEX FINANCEIRO:", err);
      return res.status(500).json({ 
        error: 'Erro ao carregar dados financeiros.', 
        details: err.message 
      });
    }
  },

  /**
   * LIMPA A TABELA PARA TESTES (CUIDADO!)
   */
  async truncate(req, res) {
    try {
      // destroy({ truncate: true }) limpa a tabela e reseta o AUTO_INCREMENT
      await Contribution.destroy({ truncate: true, cascade: false });
      
      return res.json({ message: 'Base financeira resetada com sucesso!' });
    } catch (err) {
      console.error("❌ Erro ao limpar banco:", err);
      return res.status(500).json({ error: 'Falha ao limpar registros.' });
    }
  },

  /**
   * CONFIRMA PAGAMENTO DE UMA MENSALIDADE
   */
  async pay(req, res) {
    try {
      const { id } = req.params;
      const { paymentMethod, notes } = req.body;

      const contribution = await Contribution.findByPk(id);
      
      if (!contribution) {
        return res.status(404).json({ error: 'Lançamento não encontrado.' });
      }

      await contribution.update({
        status: 'Pago',
        paymentDate: new Date(),
        paymentMethod: paymentMethod || 'Pix',
        notes: notes || contribution.notes
      });

      return res.json({ message: 'Pagamento confirmado!', data: contribution });
    } catch (err) {
      console.error("❌ ERRO NO PAGAMENTO:", err);
      return res.status(400).json({ error: 'Erro ao processar confirmação de pagamento.' });
    }
  }
};