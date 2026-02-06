const { Chat, Message, ChatFile, User } = require('../models');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class ChatController {
    // Создать новый чат
    async createChat(req, res) {
        try {
            const { subject } = req.body;
            const userId = req.user.id;

            const chat = await Chat.create({
                user_id: userId,
                subject: subject || 'Техническая поддержка',
                status: 'active'
            });

            return res.json(chat);
        } catch (error) {
            console.error('Error creating chat:', error);
            return res.status(500).json({ message: 'Не удалось создать чат' });
        }
    }

    // Получить все чаты пользователя
    async getUserChats(req, res) {
        try {
            const userId = req.user.id;

            const chats = await Chat.findAll({
                where: { user_id: userId },
                include: [
                    {
                        model: Message,
                        limit: 1,
                        order: [['created_at', 'DESC']]
                    }
                ],
                order: [['updated_at', 'DESC']]
            });

            return res.json(chats);
        } catch (error) {
            console.error('Error getting user chats:', error);
            return res.status(500).json({ message: 'Не удалось получить чаты' });
        }
    }

    // Получить все активные чаты для админа
    async getAllChats(req, res) {
        try {
            const chats = await Chat.findAll({
                where: { status: 'active' },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'email']
                    },
                    {
                        model: Message,
                        limit: 1,
                        order: [['created_at', 'DESC']]
                    }
                ],
                order: [['updated_at', 'DESC']]
            });

            return res.json(chats);
        } catch (error) {
            console.error('Error getting all chats:', error);
            return res.status(500).json({ message: 'Не удалось получить чаты' });
        }
    }

    // Получить сообщения чата
    async getChatMessages(req, res) {
        try {
            const { chatId } = req.params;
            const userId = req.user.id;

            // Проверка доступа к чату
            const chat = await Chat.findByPk(chatId);
            if (!chat) {
                return res.status(404).json({ message: 'Чат не найден' });
            }

            // Проверка прав доступа
            if (req.user.role !== 'ADMIN' && chat.user_id !== userId) {
                return res.status(403).json({ message: 'Нет доступа к чату' });
            }

            const messages = await Message.findAll({
                where: { chat_id: chatId },
                include: [
                    {
                        model: ChatFile,
                        as: 'files'
                    }
                ],
                order: [['created_at', 'ASC']]
            });

            // Отметить сообщения как прочитанные для админа
            if (req.user.role === 'ADMIN') {
                await Message.update(
                    { is_read: true },
                    { where: { chat_id: chatId, sender_type: 'user' } }
                );
            }

            return res.json(messages);
        } catch (error) {
            console.error('Error getting chat messages:', error);
            return res.status(500).json({ message: 'Не удалось получить сообщения' });
        }
    }

    // Отправить сообщение
    async sendMessage(req, res) {
        try {
            const { chatId, content } = req.body;
            const userId = req.user.id;
            const files = req.files;

            // Проверка доступа к чату
            const chat = await Chat.findByPk(chatId);
            if (!chat) {
                return res.status(404).json({ message: 'Чат не найден' });
            }

            // Проверка прав доступа
            if (req.user.role !== 'ADMIN' && chat.user_id !== userId) {
                return res.status(403).json({ message: 'Нет доступа к чату' });
            }

            // Создать сообщение
            const message = await Message.create({
                chat_id: chatId,
                sender_id: userId,
                sender_type: req.user.role === 'ADMIN' ? 'admin' : 'user',
                content: content,
                is_read: false
            });

            // Обработка файлов
            if (files && files.length > 0) {
                for (const file of files) {
                    const filename = `${uuidv4()}_${file.originalname}`;
                    const uploadPath = path.join(__dirname, '..', 'uploads', 'chat', filename);

                    // Создать директорию если не существует
                    const dir = path.dirname(uploadPath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }

                    // Сохранить файл
                    fs.writeFileSync(uploadPath, file.buffer);

                    // Создать запись о файле
                    await ChatFile.create({
                        message_id: message.id,
                        filename: filename,
                        original_name: file.originalname,
                        mimetype: file.mimetype,
                        size: file.size,
                        path: `chat/${filename}`
                    });
                }
            }

            // Обновить дату последнего обновления чата
            await chat.update({ updated_at: new Date() });

            // Получить сообщение с файлами
            const messageWithFiles = await Message.findByPk(message.id, {
                include: [
                    {
                        model: ChatFile,
                        as: 'files'
                    }
                ]
            });

            return res.json(messageWithFiles);
        } catch (error) {
            console.error('Error sending message:', error);
            return res.status(500).json({ message: 'Не удалось отправить сообщение' });
        }
    }

    // Закрыть чат (только для админа)
    async closeChat(req, res) {
        try {
            const { chatId } = req.params;

            const chat = await Chat.findByPk(chatId);
            if (!chat) {
                return res.status(404).json({ message: 'Чат не найден' });
            }

            chat.status = 'closed';
            await chat.save();

            return res.json({ message: 'Чат закрыт' });
        } catch (error) {
            console.error('Error closing chat:', error);
            return res.status(500).json({ message: 'Не удалось закрыть чат' });
        }
    }

    // Получить количество непрочитанных сообщений для админа
    async getUnreadCount(req, res) {
        try {
            const count = await Message.count({
                where: {
                    sender_type: 'user',
                    is_read: false
                },
                include: [
                    {
                        model: Chat,
                        where: { status: 'active' }
                    }
                ]
            });

            return res.json({ count });
        } catch (error) {
            console.error('Error getting unread count:', error);
            return res.status(500).json({ message: 'Не удалось получить количество непрочитанных сообщений' });
        }
    }

    // Скачать файл
    async downloadFile(req, res) {
        try {
            const { fileId } = req.params;

            const file = await ChatFile.findByPk(fileId);
            if (!file) {
                return res.status(404).json({ message: 'Файл не найден' });
            }

            const filePath = path.join(__dirname, '..', 'uploads', 'chat', file.filename);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: 'Файл не найден на сервере' });
            }

            return res.download(filePath, file.original_name);
        } catch (error) {
            console.error('Error downloading file:', error);
            return res.status(500).json({ message: 'Не удалось скачать файл' });
        }
    }
}

module.exports = new ChatController();