const ExtraRecord = require('../models/ExtraRecord');
const Member = require('../models/Member');
const ExtraRecordMember = require('../models/ExtraRecordMember');

module.exports = {
  // LISTAR REGISTROS
  async index(req, res) {
    try {
      const records = await ExtraRecord.findAll({
        include: [{
          model: Member,
          as: 'participants',
          attributes: ['id', 'full_name'],
          through: { attributes: [] } // Limpa a query para evitar erro de coluna desconhecida
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

  // CRIAR REGISTRO (HÍBRIDO: MEMBROS OU EXTERNOS)
  async store(req, res) {
    try {
      const { type, description, value, date, memberIds, external_donor } = req.body;

      // Validação: precisa de pelo menos um dos dois tipos de identificação
      if ((!memberIds || memberIds.length === 0) && !external_donor) {
        return res.status(400).json({ error: 'Identifique o doador ou selecione membros.' });
      }

      // 1. Cria o registro principal (já incluindo o campo external_donor)
      const record = await ExtraRecord.create({
        type,
        description,
        value,
        date,
        external_donor: external_donor || null
      });

      // 2. Se houver membros da casa selecionados, cria os vínculos na tabela N:N
      if (memberIds && memberIds.length > 0) {
        const relations = memberIds.map(memberId => ({
          extra_record_id: record.id,
          member_id: memberId
        }));
        await ExtraRecordMember.bulkCreate(relations);
      }

      return res.status(201).json({ 
        message: 'Registro salvo com sucesso! Axé.',
        record 
      });
    } catch (err) {
      console.error("ERRO AO SALVAR:", err);
      return res.status(500).json({ 
        error: 'Erro ao salvar registro extra.',
        details: err.message 
      });
    }
  },

  // DELETAR REGISTRO
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // O Sequelize deletará automaticamente os vínculos em ExtraRecordMember 
      // se você configurou ON DELETE CASCADE no banco/model.
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