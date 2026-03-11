const Agreement = require('../models/Agreement');
const Contribution = require('../models/Contribution');
const Member = require('../models/Member');
const { sequelize } = require('../config/database');

module.exports = {
  // LISTAR TODOS OS ACORDOS
  async index(req, res) {
    try {
      const agreements = await Agreement.findAll({
        include: [{
          model: Member,
          as: 'member',
          attributes: ['id', 'full_name', 'phone_whatsapp']
        }],
        order: [['created_at', 'DESC']]
      });
      return res.json(agreements);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar acordos.' });
    }
  },

  // CRIAR NOVO ACORDO
  async create(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { memberId, installmentsCount, firstDueDate } = req.body;

      const member = await Member.findByPk(memberId);
      if (!member) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Membro não encontrado' });
      }

      const totalValue = Number(member.balance_retroactive);
      if (totalValue <= 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Este membro não possui saldo retroativo.' });
      }

      const agreement = await Agreement.create({
        member_id: memberId,
        totalValue,
        installmentsCount,
        status: 'Pendente',
        termsAccepted: false
      }, { transaction });

      const installmentValue = (totalValue / installmentsCount).toFixed(2);
      const installments = [];
      
      // Lógica para evitar erro de virada de mês (ex: dia 31)
      const dateParts = firstDueDate.split('-'); // Espera YYYY-MM-DD
      const startDay = parseInt(dateParts[2]);

      for (let i = 0; i < installmentsCount; i++) {
        let dueDate = new Date(dateParts[0], dateParts[1] - 1, startDay);
        dueDate.setMonth(dueDate.getMonth() + i);

        installments.push({
          member_id: memberId,
          agreementId: agreement.id,
          description: `ACORDO RETROATIVO - PARCELA ${i + 1}/${installmentsCount}`,
          value: installmentValue,
          originalValue: installmentValue,
          dueDate: dueDate,
          status: 'Pendente',
          type: 'Acordo'
        });
      }

      await Contribution.bulkCreate(installments, { transaction });
      await member.update({ balance_retroactive: 0 }, { transaction });

      await transaction.commit();
      return res.json({ message: 'Acordo gerado com sucesso!', agreement });

    } catch (err) {
      if (transaction) await transaction.rollback();
      console.error(err);
      return res.status(500).json({ error: 'Erro ao processar parcelamento.' });
    }
  },

  // ACEITAR TERMO
  async acceptTerms(req, res) {
    try {
      const { id } = req.params;
      const agreement = await Agreement.findByPk(id);

      if (!agreement) return res.status(404).json({ error: 'Acordo não encontrado' });

      await agreement.update({
        status: 'Ativo',
        termsAccepted: true,
        signedAt: new Date()
      });

      return res.json({ message: 'Termo de acordo aceito!' });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao aceitar termo.' });
    }
  }
};