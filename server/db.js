const { Sequelize } = require('sequelize');
require('dotenv').config();

// Временно используем SQLite для тестирования
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: false
});

module.exports = sequelize;
