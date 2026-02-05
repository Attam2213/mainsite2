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
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use('/api', router);

// Обработка ошибок должна быть последней
app.use(errorHandler);

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // alter: true if needed
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (e) {
        console.log(e);
    }
}

start();
