const Contribution = require('../models/Contribution');
const Member = require('../models/Member');
const Agreement = require('../models/Agreement'); // Importado para o truncate
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

module.exports = {
  // 1. GERA MENSALIDADES
  async generateMonthly(req, res) {
    try {
      const { month, year } = req.body;
      const DEFAULT_VALUE = 100.00;

      if (!month || !year) return res.status(400).json({ error: 'Mês e ano são obrigatórios.' });

      const description = `Mensalidade ${String(month).padStart(2, '0')}/${year}`;
      const dueDate = `${year}-${String(month).padStart(2, '0')}-20`; 

      const activeMembers = await Member.findAll({ where: { status: 'Ativo' } });

      if (activeMembers.length === 0) return res.status(404).json({ error: 'Nenhum membro ativo.' });

      const contributionsData = [];

      for (const member of activeMembers) {
        const alreadyExists = await Contribution.findOne({ 
          where: { member_id: member.id, description } 
        });

        if (!alreadyExists) {
          const rawValue = member.custom_contribution;
          let agreedValue = (rawValue !== null && rawValue !== undefined && rawValue !== '') 
            ? parseFloat(rawValue) : DEFAULT_VALUE;

          if (isNaN(agreedValue)) agreedValue = DEFAULT_VALUE;

          const residual = DEFAULT_VALUE - agreedValue;

          contributionsData.push({
            member_id: member.id, 
            description,
            value: agreedValue,
            originalValue: DEFAULT_VALUE,
            residualValue: residual > 0 ? residual : 0, 
            dueDate,
            status: agreedValue === 0 ? 'Isento' : 'Pendente',
            type: 'Mensalidade', // Importante para diferenciar de 'Acordo'
            notes: 'Geração automática via sistema'
          });
        }
      }

      if (contributionsData.length === 0) return res.status(400).json({ error: 'Já gerado para este período.' });

      await Contribution.bulkCreate(contributionsData);
      return res.json({ message: `${contributionsData.length} mensalidades geradas!` });

    } catch (err) {
      console.error("❌ Erro Geração:", err);
      return res.status(500).json({ error: 'Erro interno.' });
    }
  },

  // 2. DASHBOARD STATS
  async getStats(req, res) {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');

      const startOfMonth = `${year}-${month}-01 00:00:00`;
      const endOfMonth = `${year}-${month}-31 23:59:59`;

      const receitaMensal = await Contribution.sum('value', {
        where: {
          status: 'Pago',
          paymentDate: { [Op.between]: [startOfMonth, endOfMonth] }
        }
      }) || 0;

      const abertoNoMes = await Contribution.sum('value', {
        where: {
          status: 'Pendente',
          dueDate: { [Op.between]: [startOfMonth, endOfMonth] }
        }
      }) || 0;

      return res.json({ 
        receitaMensal: Number(receitaMensal), 
        abertoNoMes: Number(abertoNoMes) 
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro no cálculo' });
    }
  },

  // 3. LISTAGEM
  async index(req, res) {
    try {
      const contributions = await Contribution.findAll({
        include: [{ 
          model: Member, 
          as: 'member', 
          attributes: ['full_name', 'category', 'custom_contribution'] 
        }],
        order: [['due_date', 'DESC']]
      });
      return res.json(contributions);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao carregar financeiro.' });
    }
  },

  // 4. CONFIRMAR PAGAMENTO
  async pay(req, res) {
    try {
      const { id } = req.params;
      const contribution = await Contribution.findByPk(id);

      if (!contribution) return res.status(404).json({ error: "Lançamento não encontrado" });

      await contribution.update({
        status: 'Pago',
        paymentDate: new Date(), 
        paymentMethod: req.body.paymentMethod || 'Pix'
      });

      return res.json({ message: "Pagamento confirmado!" });
    } catch (err) {
      return res.status(400).json({ error: "Erro ao processar pagamento" });
    }
  },

  // 5. RESETAR TABELAS (AJUSTADO PARA ACORDOS)
  async truncate(req, res) {
    const transaction = await sequelize.transaction();
    try {
      // Desativa FKs para evitar erro de restrição ao limpar tabelas relacionadas
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });

      // Limpa as duas tabelas
      await Contribution.destroy({ truncate: true, cascade: true, transaction });
      await Agreement.destroy({ truncate: true, cascade: true, transaction });

      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });
      
      await transaction.commit();
      return res.json({ message: 'Financeiro e Acordos resetados com sucesso!' });
    } catch (err) {
      if (transaction) await transaction.rollback();
      console.error(err);
      return res.status(500).json({ error: 'Falha ao limpar registros.' });
    }
  }
};