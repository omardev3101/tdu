const Member = require('../models/Member');
const fs = require('fs');
const path = require('path');

module.exports = {
  // 1. LISTAR TODOS (Admin)
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

  // 2. CRIAR NOVO (Público/Admin - Alistamento)
  async store(req, res) {
    try {
      const photo_filename = req.file ? req.file.filename : null;
      const data = { ...req.body };

      // Normalização de campos vazios
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === 'null' || data[key] === 'undefined') {
          data[key] = null;
        }
      });
      data.photo_url = req.file.path || req.file.secure_url || req.file.filename;

      // Tratamento do campo is_voter (MySQL tinyint)
      if (data.is_voter !== undefined) {
        data.is_voter = (data.is_voter === 'true' || data.is_voter === '1' || data.is_voter === true) ? 1 : 0;
      }

      // Limpeza de máscaras
      if (data.document_cpf) data.document_cpf = data.document_cpf.replace(/\D/g, '');
      if (data.address_zip) data.address_zip = data.address_zip.replace(/\D/g, '');

      // Conversão financeira
      if (data.balance_retroactive) data.balance_retroactive = parseFloat(data.balance_retroactive);
      if (data.custom_contribution) data.custom_contribution = parseFloat(data.custom_contribution);

      const member = await Member.create(data);
      return res.status(201).json(member);

    } catch (err) {
      console.error("Erro Store:", err);
      if (req.file) {
        const filePath = path.resolve(__dirname, '..', '..', 'uploads', req.file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      return res.status(400).json({ error: 'Erro ao realizar cadastro', details: err.message });
    }
  },

  // 3. BUSCAR UM ÚNICO
  async show(req, res) {
    try {
      const member = await Member.findByPk(req.params.id);
      if (!member) return res.status(404).json({ error: 'Membro não encontrado' });
      return res.json(member);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar dados.' });
    }
  },

  // 4. APROVAÇÃO E CONFIGURAÇÃO FINANCEIRA (Diretoria)
  async updateConfig(req, res) {
    try {
      const { id } = req.params;
      const { password, custom_contribution, balance_retroactive, role, status } = req.body;
      
      const member = await Member.findByPk(id);
      if (!member) return res.status(404).json({ error: 'Membro não encontrado' });

      await member.update({ 
        password_hash: password || member.password_hash, 
        custom_contribution: custom_contribution !== undefined ? parseFloat(custom_contribution) : member.custom_contribution, 
        balance_retroactive: balance_retroactive !== undefined ? parseFloat(balance_retroactive) : member.balance_retroactive,
        role: role || member.role,
        status: status || 'Ativo' 
      });

      return res.json({ message: "Configurações do membro atualizadas com sucesso!" });
    } catch (err) {
      console.error("Erro UpdateConfig:", err);
      return res.status(500).json({ error: "Erro ao configurar membro." });
    }
  },

  // 5. ATUALIZAÇÃO GERAL (Perfil/Admin)
  async update(req, res) {
    try {
      const { id } = req.params;
      const member = await Member.findByPk(id);
      if (!member) return res.status(404).json({ error: 'Membro não encontrado' });

      const updateData = { ...req.body };

      // Segurança: Não permite alterar permissões ou status nesta rota comum
      delete updateData.id;
      delete updateData.role;
      delete updateData.status;

      // Normalização e Limpeza
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === 'null') updateData[key] = null;
      });

      if (updateData.document_cpf) updateData.document_cpf = updateData.document_cpf.replace(/\D/g, '');
      if (updateData.address_zip) updateData.address_zip = updateData.address_zip.replace(/\D/g, '');
      
      // Tratamento is_voter no update
      if (updateData.is_voter !== undefined) {
        updateData.is_voter = (updateData.is_voter === 'true' || updateData.is_voter === '1' || updateData.is_voter === true) ? 1 : 0;
      }

      // Tratamento de foto
      if (req.file) {
        if (member.photo_url) {
          const oldPath = path.resolve(__dirname, '..', '..', 'uploads', member.photo_url);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.photo_url = req.file.filename;
      }

      await member.update(updateData);
      return res.json(member);
    } catch (err) {
      console.error("Erro Update:", err);
      return res.status(400).json({ error: 'Erro ao atualizar perfil.', details: err.message });
    }
  },

  // 6. DELETAR
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
      console.error("Erro Delete:", err);
      return res.status(500).json({ error: 'Erro ao remover registro.' });
    }
  }
};