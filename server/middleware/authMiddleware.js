const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }
    try {
        const authHeader = req.headers.authorization;
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
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({message: "Не авторизован"});
    }
};
