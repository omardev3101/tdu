// src/controllers/ExtraRecordController.js
const ExtraRecord = require('../models/ExtraRecord');
const Member = require('../models/Member');
const ExtraRecordMember = require('../models/ExtraRecordMember');

module.exports = {
  // LISTAR REGISTROS COM PARTICIPANTES
  async index(req, res) {
    try {
      const records = await ExtraRecord.findAll({
        include: [{
          model: Member,
          as: 'participants',
          attributes: ['id', 'full_name'],
          through: { attributes: [] } // Oculta dados da tabela de ligação
        }],
        order: [['date', 'DESC']]
      });
      return res.json(records);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar registros.', details: err.message });
    }
  },

  // CRIAR REGISTRO (INDIVIDUAL OU COLETIVO)
  async store(req, res) {
    try {
      const { type, description, value, date, memberIds } = req.body;

      if (!memberIds || memberIds.length === 0) {
        return res.status(400).json({ error: 'Selecione ao menos um membro.' });
      }

      // 1. Cria o registro principal
      const record = await ExtraRecord.create({
        type,
        description,
        value,
        date
      });

      // 2. Vincula os membros (Trabalho Coletivo ou Individual)
      const relations = memberIds.map(memberId => ({
        extra_record_id: record.id,
        member_id: memberId
      }));

      await ExtraRecordMember.bulkCreate(relations);

      return res.status(201).json({ 
        message: 'Registro e vínculos criados com sucesso!',
        record 
      });
    } catch (err) {
      console.error("ERRO EXTRA RECORD:", err);
      return res.status(500).json({ error: 'Erro ao salvar registro extra.' });
    }
  },

  // DELETAR REGISTRO
  async delete(req, res) {
    try {
      const { id } = req.params;
      await ExtraRecord.destroy({ where: { id } });
      return res.json({ message: 'Registro removido.' });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao deletar.' });
    }
  }
};