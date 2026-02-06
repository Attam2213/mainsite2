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
            console.log('=== НАЧАЛО РЕГИСТРАЦИИ ===');
            console.log('Время:', new Date().toISOString());
            console.log('IP адрес:', req.ip);
            console.log('User-Agent:', req.get('User-Agent'));
            console.log('Данные запроса:', { email: req.body.email });

            const { email, password } = req.body;

            if (!email || !password) {
                console.log('❌ ОШИБКА: Email или пароль отсутствуют');
                return next(ApiError.badRequest('Email и пароль обязательны'));
            }

            // Валидация email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.log('❌ ОШИБКА: Неверный формат email:', email);
                return next(ApiError.badRequest('Неверный формат email'));
            }
            console.log('✅ Email валиден:', email);

            // Валидация пароля
            if (password.length < 6) {
                console.log('❌ ОШИБКА: Пароль слишком короткий, длина:', password.length);
                return next(ApiError.badRequest('Пароль должен быть не менее 6 символов'));
            }
            console.log('✅ Пароль валиден, длина:', password.length);

            // Проверка существующего пользователя
            console.log('🔍 Проверка существующего пользователя...');
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                console.log('❌ ОШИБКА: Пользователь уже существует:', email);
                return next(ApiError.badRequest('Пользователь с таким email уже существует'));
            }
            console.log('✅ Пользователь не найден, можно создавать');

            // Хеширование пароля
            console.log('🔐 Хеширование пароля...');
            const hashPassword = await bcrypt.hash(password, 10);
            console.log('✅ Пароль захеширован');

            // Создание пользователя
            console.log('👤 Создание пользователя...');
            const user = await User.create({
                email,
                password: hashPassword,
                role: 'USER'
            });
            console.log('✅ Пользователь создан, ID:', user.id);

            // Генерация токена
            console.log('🔑 Генерация JWT токена...');
            const token = generateJwt(user.id, user.email, user.role);
            console.log('✅ Токен сгенерирован');

            // Возвращаем пользователя без пароля
            const userData = {
                id: user.id,
                email: user.email,
                role: user.role,
                domain: user.domain,
                server_ip: user.server_ip
            };

            console.log('=== РЕГИСТРАЦИЯ УСПЕШНА ===');
            console.log('Пользователь ID:', user.id);
            console.log('Email:', user.email);
            console.log('==========================');

            return res.json({
                token,
                user: userData
            });

        } catch (error) {
            console.error('❌ КРИТИЧЕСКАЯ ОШИБКА РЕГИСТРАЦИИ:');
            console.error('Ошибка:', error.message);
            console.error('Стек:', error.stack);
            console.error('Время:', new Date().toISOString());
            return next(ApiError.internal('Ошибка при регистрации'));
        }
    }

    async login(req, res, next) {
        try {
            console.log('=== НАЧАЛО ВХОДА ===');
            console.log('Время:', new Date().toISOString());
            console.log('IP адрес:', req.ip);
            console.log('User-Agent:', req.get('User-Agent'));
            console.log('Данные запроса:', { email: req.body.email });

            const { email, password } = req.body;

            if (!email || !password) {
                console.log('❌ ОШИБКА: Email или пароль отсутствуют');
                return next(ApiError.badRequest('Email и пароль обязательны'));
            }

            // Поиск пользователя
            console.log('🔍 Поиск пользователя:', email);
            const user = await User.findOne({ where: { email } });
            if (!user) {
                console.log('❌ ОШИБКА: Пользователь не найден');
                return next(ApiError.badRequest('Пользователь не найден'));
            }
            console.log('✅ Пользователь найден, ID:', user.id);

            // Проверка пароля
            console.log('🔐 Проверка пароля...');
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                console.log('❌ ОШИБКА: Неверный пароль для пользователя ID:', user.id);
                return next(ApiError.badRequest('Неверный пароль'));
            }
            console.log('✅ Пароль верный');

            // Генерация токена
            console.log('🔑 Генерация JWT токена...');
            const token = generateJwt(user.id, user.email, user.role);
            console.log('✅ Токен сгенерирован');

            // Возвращаем пользователя без пароля
            const userData = {
                id: user.id,
                email: user.email,
                role: user.role,
                domain: user.domain,
                server_ip: user.server_ip
            };

            console.log('=== ВХОД УСПЕШЕН ===');
            console.log('Пользователь ID:', user.id);
            console.log('Email:', user.email);
            console.log('===================');

            return res.json({
                token,
                user: userData
            });

        } catch (error) {
            console.error('❌ КРИТИЧЕСКАЯ ОШИБКА ВХОДА:');
            console.error('Ошибка:', error.message);
            console.error('Стек:', error.stack);
            console.error('Время:', new Date().toISOString());
            return next(ApiError.internal('Ошибка при входе'));
        }
    }

    async check(req, res, next) {
        try {
            console.log('=== ПРОВЕРКА АВТОРИЗАЦИИ ===');
            console.log('Время:', new Date().toISOString());
            console.log('User ID из токена:', req.user.id);

            const user = await User.findOne({ 
                where: { id: req.user.id },
                attributes: { exclude: ['password'] }
            });

            if (!user) {
                console.log('❌ ОШИБКА: Пользователь не найден при проверке токена');
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            console.log('✅ Пользователь найден, генерация нового токена');

            // Генерация нового токена
            const token = generateJwt(user.id, user.email, user.role);

            console.log('=== ПРОВЕРКА УСПЕШНА ===');

            return res.json({
                token,
                user: user
            });

        } catch (error) {
            console.error('❌ ОШИБКА ПРОВЕРКИ АВТОРИЗАЦИИ:');
            console.error('Ошибка:', error.message);
            console.error('Стек:', error.stack);
            console.error('Время:', new Date().toISOString());
            return next(ApiError.internal('Ошибка при проверке авторизации'));
        }
    }
}

module.exports = new AuthController();