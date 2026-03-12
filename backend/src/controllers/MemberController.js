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
    // Captura o nome do arquivo gerado pelo Multer
    const photo_filename = req.file ? req.file.filename : null;
    const data = { ...req.body };

    // Normalização de campos vazios (Crucial para campos DATE e ENUM)
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === 'null' || data[key] === 'undefined') {
        data[key] = null;
      }
    });

    // 1. Vincula a foto à coluna correta do banco
    data.photo_url = photo_filename;

    // 2. Tratamento do campo is_voter (MySQL espera 0 ou 1)
    if (data.is_voter !== undefined) {
      data.is_voter = (data.is_voter === 'true' || data.is_voter === '1' || data.is_voter === true) ? 1 : 0;
    }

    // 3. Limpeza de máscaras (CPF e CEP)
    if (data.document_cpf) data.document_cpf = data.document_cpf.replace(/\D/g, '');
    if (data.address_zip) data.address_zip = data.address_zip.replace(/\D/g, '');

    // 4. Conversão de valores financeiros
    if (data.balance_retroactive) data.balance_retroactive = parseFloat(data.balance_retroactive);
    if (data.custom_contribution) data.custom_contribution = parseFloat(data.custom_contribution);

    // Salva no banco (O Sequelize vai mapear o 'previous_house' automaticamente aqui)
    const member = await Member.create(data);

    return res.status(201).json(member);

  } catch (err) {
    console.error("Erro Store:", err);
    
    // Cleanup: Se falhou o DB, removemos a foto salva para não entulhar o servidor
    if (req.file) {
      const filePath = path.resolve(__dirname, '..', '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    return res.status(400).json({ 
      error: 'Erro ao realizar cadastro', 
      details: err.message 
    });
  }
},

  // 3. BUSCAR UM ÚNICO
  async show(req, res) {
    try {
      const { id } = req.params;
      const member = await Member.findByPk(id);
      
      if (!member) return res.status(404).json({ error: 'Membro não encontrado' });
      
      return res.json(member);
    } catch (err) {
      console.error("Erro Show:", err);
      return res.status(500).json({ error: 'Erro ao buscar dados.' });
    }
  },

  // 4. APROVAÇÃO E CONFIGURAÇÃO FINANCEIRA
  async updateConfig(req, res) {
    try {
      const { id } = req.params;
      const { password, custom_contribution, balance_retroactive, role } = req.body;
      
      const member = await Member.findByPk(id);
      if (!member) return res.status(404).json({ error: 'Membro não encontrado' });

      // Atualiza e ativa o membro (Ideal aplicar Bcrypt no password antes do update)
      await member.update({ 
        password_hash: password, // Note que no model usamos password_hash
        custom_contribution: parseFloat(custom_contribution) || 100.00, 
        balance_retroactive: parseFloat(balance_retroactive) || 0.00,
        role: role || 'member',
        status: 'Ativo' 
      });

      return res.json({ message: "Membro aprovado e ativado com sucesso!" });
    } catch (err) {
      console.error("Erro UpdateConfig:", err);
      return res.status(500).json({ error: "Erro ao aprovar membro." });
    }
  },

  // 5. ATUALIZAÇÃO GERAL (Perfil)
  async update(req, res) {
    try {
      const { id } = req.params;
      const member = await Member.findByPk(id);

      if (!member) return res.status(404).json({ error: 'Membro não encontrado' });

      const updateData = { ...req.body };

      // Segurança: impede alteração manual de ID
      delete updateData.id;
      
      // Normalização
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === 'null' || updateData[key] === 'undefined') {
          updateData[key] = null;
        }
      });

      // Tratamento de foto na edição
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
      return res.status(400).json({ error: 'Erro ao atualizar perfil.' });
    }
  },

  // 6. DELETAR (Exclusão física)
  async delete(req, res) {
    try {
      const member = await Member.findByPk(req.params.id);
      if (!member) return res.status(404).json({ error: 'Membro não encontrado' });

      // Remove arquivo físico
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