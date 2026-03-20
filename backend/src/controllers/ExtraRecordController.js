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
  async index(req, res) {
  try {
    const records = await ExtraRecord.findAll({
      include: [
        {
          model: Member,
          as: 'participants',
          attributes: ['id', 'full_name'],
          // ESSA LINHA É A SOLUÇÃO:
          through: { attributes: [] } 
        }
      ],
      order: [['date', 'DESC']]
    });

    return res.json(records);
  } catch (err) {
    console.error("ERRO SQL:", err);
    return res.status(500).json({ 
      error: 'Erro ao listar registros.', 
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