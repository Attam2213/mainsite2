const Router = require('express');
const router = new Router();
const portfolioController = require('../controllers/portfolioController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/')
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, uuid.v4() + ext)
    }
})

const upload = multer({ storage: storage });

router.post('/', authMiddleware, upload.single('image'), portfolioController.create);
router.get('/', portfolioController.getAll);
router.delete('/:id', authMiddleware, portfolioController.delete);

module.exports = router;
