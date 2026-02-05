const Router = require('express');
const router = new Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Маршруты для авторизации
router.post('/registration', authController.registration);
router.post('/login', authController.login);
router.get('/auth', authMiddleware, authController.check);

// Маршруты для пользователя
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.post('/balance/top-up', authMiddleware, userController.topUpBalance);
router.get('/users', authMiddleware, userController.getAllUsers);
router.post('/payment/yoomoney', authMiddleware, userController.createYooMoneyPayment);
router.post('/payment/yoomoney/webhook', userController.handleYooMoneyWebhook); // Webhook без авторизации

module.exports = router;