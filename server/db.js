const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Проверяем, заданы ли переменные окружения для PostgreSQL
if (process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST) {
    // PostgreSQL configuration for VDS
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
} else {
    // Заглушка для локального тестирования без базы данных
    console.log('⚠️  PostgreSQL не настроен, используем заглушку для тестирования');
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
    });
}

module.exports = sequelize;