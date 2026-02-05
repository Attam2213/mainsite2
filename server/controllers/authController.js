const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../error/ApiError');

const generateJwt = (id, email, role) => {
    return jwt.sign(
        { id, email, role },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    );
};

class AuthController {
    async registration(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return next(ApiError.badRequest('Email и пароль обязательны'));
            }

            // Валидация email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return next(ApiError.badRequest('Неверный формат email'));
            }

            // Валидация пароля
            if (password.length < 6) {
                return next(ApiError.badRequest('Пароль должен быть не менее 6 символов'));
            }

            // Проверка существующего пользователя
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return next(ApiError.badRequest('Пользователь с таким email уже существует'));
            }

            // Хеширование пароля
            const hashPassword = await bcrypt.hash(password, 10);

            // Создание пользователя
            const user = await User.create({
                email,
                password: hashPassword,
                role: 'USER'
            });

            // Генерация токена
            const token = generateJwt(user.id, user.email, user.role);

            // Возвращаем пользователя без пароля
            const userData = {
                id: user.id,
                email: user.email,
                role: user.role,
                domain: user.domain,
                server_ip: user.server_ip
            };

            return res.json({
                token,
                user: userData
            });

        } catch (error) {
            console.error('Ошибка регистрации:', error);
            return next(ApiError.internal('Ошибка при регистрации'));
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return next(ApiError.badRequest('Email и пароль обязательны'));
            }

            // Поиск пользователя
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            // Проверка пароля
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return next(ApiError.badRequest('Неверный пароль'));
            }

            // Генерация токена
            const token = generateJwt(user.id, user.email, user.role);

            // Возвращаем пользователя без пароля
            const userData = {
                id: user.id,
                email: user.email,
                role: user.role,
                domain: user.domain,
                server_ip: user.server_ip
            };

            return res.json({
                token,
                user: userData
            });

        } catch (error) {
            console.error('Ошибка входа:', error);
            return next(ApiError.internal('Ошибка при входе'));
        }
    }

    async check(req, res, next) {
        try {
            const user = await User.findOne({ 
                where: { id: req.user.id },
                attributes: { exclude: ['password'] }
            });

            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            // Генерация нового токена
            const token = generateJwt(user.id, user.email, user.role);

            return res.json({
                token,
                user: user
            });

        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            return next(ApiError.internal('Ошибка при проверке авторизации'));
        }
    }
}

module.exports = new AuthController();