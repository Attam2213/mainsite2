const ApiError = require('../error/ApiError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {User} = require('../models');

const generateJwt = (id, email, role) => {
    return jwt.sign(
        {id, email, role},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController {
    async registration(req, res, next) {
        const {email, password} = req.body;
        
        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !password) {
            return next(ApiError.badRequest('Некорректный email или пароль'));
        }
        if (!emailRegex.test(email)) {
            return next(ApiError.badRequest('Некорректный формат email'));
        }
        if (password.length < 6) {
            return next(ApiError.badRequest('Пароль должен быть не менее 6 символов'));
        }
        
        const candidate = await User.findOne({where: {email}});
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'));
        }
        const hashPassword = await bcrypt.hash(password, 5);
        const user = await User.create({email, role: 'USER', password: hashPassword});
        const token = generateJwt(user.id, user.email, user.role);
        return res.json({token});
    }

    async login(req, res, next) {
        const {email, password} = req.body;
        const user = await User.findOne({where: {email}});
        if (!user) {
            return next(ApiError.internal('Пользователь не найден'));
        }
        let comparePassword = bcrypt.compareSync(password, user.password);
        if (!comparePassword) {
            return next(ApiError.internal('Указан неверный пароль'));
        }
        const token = generateJwt(user.id, user.email, user.role);
        return res.json({token});
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role);
        return res.json({token});
    }

    async getProfile(req, res) {
        const user = await User.findOne({where: {id: req.user.id}});
        return res.json(user);
    }
    
    async assignServer(req, res, next) {
        const {userId, domain, server_ip} = req.body;
        if (req.user.role !== 'ADMIN') {
             return next(ApiError.forbidden('Нет доступа'));
        }
        const user = await User.findOne({where: {id: userId}});
        if (!user) return next(ApiError.badRequest('User not found'));
        
        user.domain = domain;
        user.server_ip = server_ip;
        await user.save();
        return res.json(user);
    }
}

module.exports = new UserController();
