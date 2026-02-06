const {Portfolio} = require('../models');
const ApiError = require('../error/ApiError');
const fs = require('fs');
const path = require('path');

class PortfolioController {
    async create(req, res, next) {
        try {
            if (req.user.role !== 'ADMIN') {
                return next(ApiError.forbidden('Доступ запрещен'));
            }

            const {title, description, link} = req.body;
            
            // Валидация обязательных полей
            if (!title || title.trim().length === 0) {
                return next(ApiError.badRequest('Название работы обязательно'));
            }
            
            if (title.length > 100) {
                return next(ApiError.badRequest('Название не должно превышать 100 символов'));
            }
            
            if (description && description.length > 500) {
                return next(ApiError.badRequest('Описание не должно превышать 500 символов'));
            }
            
            if (link && !link.startsWith('http')) {
                return next(ApiError.badRequest('Ссылка должна начинаться с http:// или https://'));
            }
            
            let fileName = null;
            if (req.file) {
                fileName = req.file.filename;
            }
            
            const portfolio = await Portfolio.create({
                title: title.trim(), 
                description: description?.trim(), 
                link: link?.trim(), 
                image: fileName
            });
            
            return res.json(portfolio);
        } catch (e) {
            // Удаляем загруженный файл при ошибке
            if (req.file) {
                const filePath = path.join(__dirname, '..', 'static', req.file.filename);
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Ошибка при удалении файла:', err);
                });
            }
            next(ApiError.badRequest(e.message));
        }
    }

    async getAll(req, res) {
        const portfolios = await Portfolio.findAll({
            order: [['createdAt', 'DESC']]
        });
        return res.json(portfolios);
    }
    
    async delete(req, res, next) {
        try {
            if (req.user.role !== 'ADMIN') {
                return next(ApiError.forbidden('Доступ запрещен'));
            }

            const {id} = req.params;
            
            if (!id || isNaN(id)) {
                return next(ApiError.badRequest('Неверный ID'));
            }
            
            // Найти портфолио для удаления связанного файла
            const portfolio = await Portfolio.findOne({where: {id}});
            if (!portfolio) {
                return next(ApiError.badRequest('Работа не найдена'));
            }
            
            // Удалить файл изображения если он есть
            if (portfolio.image) {
                const filePath = path.join(__dirname, '..', 'static', portfolio.image);
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Ошибка при удалении файла:', err);
                });
            }
            
            await Portfolio.destroy({where: {id}});
            return res.json({message: 'Работа удалена'});
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
}

module.exports = new PortfolioController();
