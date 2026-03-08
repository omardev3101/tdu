const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

module.exports = {
  async store(req, res) {
    const { email, password } = req.body;

    // 1. Verificar se o usuário existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    // 2. Verificar se a senha bate
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Senha inválida.' });
    }

    const { id, name, role } = user;

    // 3. Gerar o Token JWT
    return res.json({
      user: { id, name, email, role },
      token: jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d', // O login dura 7 dias
      }),
    });
  }
};