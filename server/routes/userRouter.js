const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/registration', userController.registration);
router.post('/login', userController.login);
router.get('/auth', authMiddleware, userController.check);
router.get('/profile', authMiddleware, userController.getProfile);
router.post('/assign-server', authMiddleware, userController.assignServer);

module.exports = router;
