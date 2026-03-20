const ExtraRecord = require('../models/ExtraRecord');
const Member = require('../models/Member');
const ExtraRecordMember = require('../models/ExtraRecordMember');

module.exports = {
  // 1. LISTAR (GET /extra-records)
  async index(req, res) {
    try {
      const records = await ExtraRecord.findAll({
        include: [{
          model: Member,
          as: 'participants',
          attributes: ['id', 'full_name'],
          through: { attributes: [] } // Evita o erro de coluna desconhecida
        }],
        order: [['date', 'DESC']]
      });
      return res.json(records);
    } catch (err) {
      console.error("ERRO AO LISTAR:", err);
      return res.status(500).json({ 
        error: 'Erro ao listar registros.', 
        details: err.message 
      });
    }
  },

  // 2. CRIAR (POST /extra-records) - Esta função estava faltando!
  async store(req, res) {
    try {
      const { type, description, value, date, memberIds, external_donor } = req.body;

      // Validação: precisa de pelo menos um membro ou um doador externo
      if ((!memberIds || memberIds.length === 0) && !external_donor) {
        return res.status(400).json({ error: 'Selecione um membro ou digite o nome do doador externo.' });
      }

      // Cria o registro principal
      const record = await ExtraRecord.create({
        type,
        description,
        value,
        date,
        external_donor: external_donor || null
      });

      // Se houver membros selecionados, cria os vínculos na tabela intermediária
      if (memberIds && memberIds.length > 0) {
        const relations = memberIds.map(memberId => ({
          extra_record_id: record.id,
          member_id: memberId
        }));
        await ExtraRecordMember.bulkCreate(relations);
      }

      return res.status(201).json({ 
        message: 'Registro salvo com sucesso!',
        record 
      });
    } catch (err) {
      console.error("ERRO AO SALVAR:", err);
      return res.status(500).json({ error: 'Erro ao salvar registro extra.' });
    }
  },

  // 3. DELETAR (DELETE /extra-records/:id)
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await ExtraRecord.destroy({ where: { id } });

      if (!deleted) {
        return res.status(404).json({ error: 'Registro não encontrado.' });
      }

      return res.json({ message: 'Registro removido com sucesso.' });
    } catch (err) {
      console.error("ERRO AO DELETAR:", err);
      return res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
  }
};