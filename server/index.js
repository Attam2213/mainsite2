require('dotenv').config();
const express = require('express');
const sequelize = require('./db');
const models = require('./models');
const cors = require('cors');
const router = require('./routes/index');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const PORT = process.env.PORT || 5000;

const app = express();

// Более строгая настройка CORS
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use('/api', router);

// Обработка ошибок должна быть последней
app.use(errorHandler);

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('База данных подключена успешно.');
        
        await sequelize.sync(); // alter: true if needed
        console.log('Модели синхронизированы с базой данных.');
        
        app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
    } catch (e) {
        console.error('Ошибка при запуске сервера:', e);
        process.exit(1);
    }
}

start();
