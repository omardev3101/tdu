const { Sequelize } = require('sequelize');
require('dotenv').config();

const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST, 
  dialect: 'mysql',
  logging: (msg) => console.log(`[SEQUELIZE SQL]: ${msg}`),
  define: {
    timestamps: true,
    underscored: true
  }
};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

module.exports = config; 
module.exports.sequelize = sequelize;