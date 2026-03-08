const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const {sequelize} = require('../config/database');

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { 
    type: DataTypes.VIRTUAL // Campo virtual que não vai para o banco
  },
  role: {
  type: DataTypes.ENUM('DIRETOR', 'DIRETOR DE TECNOLOGIA', 'TESOUREIRO', 'SECRETÁRIO', 'MEMBRO'),
  defaultValue: 'MEMBRO'
},
  password_hash: { type: DataTypes.STRING }
}, {
  hooks: {
    beforeSave: async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    }
  }
});

module.exports = User;