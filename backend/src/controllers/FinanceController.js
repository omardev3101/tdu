const { Payment, Member } = require('../models');

module.exports = {
  // Registrar um pagamento (Dar baixa)
  async pay(req, res) {
    const { id } = req.params;
    try {
      const payment = await Payment.findByPk(id);
      if (!payment) return res.status(404).json({ error: 'Título não encontrado.' });

      await payment.update({
        status: 'Pago',
        paymentDate: new Date()
      });

      return res.json(payment);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao processar pagamento.' });
    }
  },

  // Gerar mensalidades para todos os membros ativos
  async generateMonthly(req, res) {
    const { amount, dueDate } = req.body;
    try {
      const activeMembers = await Member.findAll({ where: { status: 'Ativo' } });
      
      const payments = activeMembers.map(member => ({
        member_id: member.id,
        amount,
        dueDate,
        type: 'Mensalidade'
      }));

      await Payment.bulkCreate(payments);
      return res.status(201).json({ message: 'Mensalidades geradas com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao gerar mensalidades.' });
    }
  }
};