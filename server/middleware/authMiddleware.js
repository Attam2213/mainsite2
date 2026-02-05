const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    console.log('Auth middleware - Запрос к:', req.path, 'Метод:', req.method);
    if (req.method === "OPTIONS") {
        next();
    }
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth middleware - Authorization header:', authHeader);
        if (!authHeader) {
            return res.status(401).json({message: "Не авторизован"});
        }
        
        const tokenParts = authHeader.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return res.status(401).json({message: "Неверный формат токена"});
        }
        
        const token = tokenParts[1];
        if (!token) {
            return res.status(401).json({message: "Не авторизован"});
        }
        
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log('Auth middleware - Decoded token:', decoded);
        req.user = decoded;
        next();
    } catch (e) {
        console.log('Auth middleware - Error:', e.message);
        res.status(401).json({message: "Не авторизован"});
    }
};
