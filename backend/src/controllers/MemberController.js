const Member = require('../models/Member');
const fs = require('fs');
const path = require('path');

module.exports = {
  // LISTAR TODOS
  async index(req, res) {
    try {
      const members = await Member.findAll({ 
        order: [['full_name', 'ASC']] 
      });
      return res.json(members);
    } catch (err) {
      console.error("Erro Index:", err);
      return res.status(500).json({ error: 'Erro ao listar membros.' });
    }
  },

  // CRIAR NOVO
  async store(req, res) {
    try {
      const photo_url = req.file ? req.file.filename : null;
      const data = { ...req.body };

      // 1. Limpeza e Conversão de tipos (Crucial para DECIMAL e BOOLEAN)
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === 'null' || data[key] === 'undefined') {
          data[key] = null;
        }
      });

      // Conversão explícita para os campos financeiros
      if (data.customContribution) data.customContribution = parseFloat(data.customContribution);
      if (data.balanceRetroactive) data.balanceRetroactive = parseFloat(data.balanceRetroactive);
      
      // Ajuste de Booleano
      data.isVoter = (data.isVoter === 'true' || data.isVoter === true);
      data.photo_url = photo_url;

      const member = await Member.create(data);
      return res.json(member);
    } catch (err) {
      console.error("Erro Store:", err);
      if (req.file) {
        const filePath = path.resolve(__dirname, '..', '..', 'uploads', req.file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      return res.status(400).json({ error: 'Erro ao cadastrar', details: err.message });
    }
  },

  // BUSCAR UM ÚNICO
  async show(req, res) {
    try {
      const member = await Member.findByPk(req.params.id);
      if (!member) return res.status(404).json({ error: 'Membro não encontrado' });
      return res.json(member);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar membro.' });
    }
  },

  // ATUALIZAR
  async update(req, res) {
    try {
      const { id } = req.params;
      const member = await Member.findByPk(id);

      if (!member) {
        return res.status(404).json({ error: 'Membro não encontrado' });
      }

      const updateData = { ...req.body };

      // 1. Limpeza de campos de sistema
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // 2. Normalização de dados vindos do FormData
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === 'null' || updateData[key] === 'undefined') {
          updateData[key] = null;
        }
      });

      // 3. CONVERSÃO EXPLÍCITA (Resolve o erro de não atualizar valor)
      if (updateData.customContribution !== undefined) {
        updateData.customContribution = parseFloat(updateData.customContribution) || 0;
      }
      if (updateData.balanceRetroactive !== undefined) {
        updateData.balanceRetroactive = parseFloat(updateData.balanceRetroactive) || 0;
      }
      if (updateData.isVoter !== undefined) {
        updateData.isVoter = (updateData.isVoter === 'true' || updateData.isVoter === true);
      }

      // 4. Lógica de Troca de Foto
      if (req.file) {
        if (member.photo_url) {
          const oldPath = path.resolve(__dirname, '..', '..', 'uploads', member.photo_url);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.photo_url = req.file.filename;
      }

      // 5. Salva no Banco de Dados
      await member.update(updateData);
      
      return res.json(member);

    } catch (err) {
      console.error("ERRO NO UPDATE:", err);
      return res.status(400).json({ 
        error: 'Erro ao atualizar membro.', 
        details: err.message 
      });
    }
  },

  // DELETAR
  async delete(req, res) {
    try {
      const member = await Member.findByPk(req.params.id);
      if (!member) return res.status(404).json({ error: 'Membro não encontrado' });

      if (member.photo_url) {
        const photoPath = path.resolve(__dirname, '..', '..', 'uploads', member.photo_url);
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
      }

      await member.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao deletar membro.' });
    }
  }
};