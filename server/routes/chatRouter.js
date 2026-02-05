const Router = require('express');
const router = new Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Настройка multer для загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        // Разрешенные типы файлов
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Недопустимый тип файла'), false);
        }
    }
});

// Маршруты для пользователей
router.post('/', authMiddleware, chatController.createChat);
router.get('/my', authMiddleware, chatController.getUserChats);
router.get('/:chatId/messages', authMiddleware, chatController.getChatMessages);
router.post('/:chatId/messages', authMiddleware, upload.array('files', 5), chatController.sendMessage);

// Маршруты для администраторов
router.get('/all', authMiddleware, chatController.getAllChats);
router.put('/:chatId/close', authMiddleware, chatController.closeChat);
router.get('/unread-count', authMiddleware, chatController.getUnreadCount);

// Скачивание файлов
router.get('/files/:fileId/download', authMiddleware, chatController.downloadFile);

module.exports = router;