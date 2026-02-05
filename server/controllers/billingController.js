const { Service, Invoice, User } = require('../models');
const ApiError = require('../error/ApiError');

class ServiceController {
    async createService(req, res, next) {
        try {
            const { name, price, description, type } = req.body;

            if (!name || !price) {
                return next(ApiError.badRequest('Название и цена обязательны'));
            }

            const service = await Service.create({
                name,
                price,
                description: description || '',
                type: type || 'one-time',
                is_active: true
            });

            return res.json({ service, message: 'Услуга создана успешно' });

        } catch (error) {
            console.error('Ошибка создания услуги:', error);
            return next(ApiError.internal('Ошибка при создании услуги'));
        }
    }

    async getAllServices(req, res, next) {
        try {
            const services = await Service.findAll({
                where: { is_active: true },
                order: [['name', 'ASC']]
            });

            return res.json(services);

        } catch (error) {
            console.error('Ошибка получения услуг:', error);
            return next(ApiError.internal('Ошибка при получении услуг'));
        }
    }

    async updateService(req, res, next) {
        try {
            const { id } = req.params;
            const { name, price, description, type, is_active } = req.body;

            const service = await Service.findOne({ where: { id } });
            if (!service) {
                return next(ApiError.badRequest('Услуга не найдена'));
            }

            await service.update({
                name: name || service.name,
                price: price || service.price,
                description: description !== undefined ? description : service.description,
                type: type || service.type,
                is_active: is_active !== undefined ? is_active : service.is_active
            });

            return res.json({ service, message: 'Услуга обновлена успешно' });

        } catch (error) {
            console.error('Ошибка обновления услуги:', error);
            return next(ApiError.internal('Ошибка при обновлении услуги'));
        }
    }

    async deleteService(req, res, next) {
        try {
            const { id } = req.params;

            const service = await Service.findOne({ where: { id } });
            if (!service) {
                return next(ApiError.badRequest('Услуга не найдена'));
            }

            await service.update({ is_active: false });

            return res.json({ message: 'Услуга деактивирована' });

        } catch (error) {
            console.error('Ошибка деактивации услуги:', error);
            return next(ApiError.internal('Ошибка при деактивации услуги'));
        }
    }
}

class InvoiceController {
    async createInvoice(req, res, next) {
        try {
            const { user_id, service_id, amount, description, type, due_date } = req.body;

            if (!user_id || !service_id || !amount) {
                return next(ApiError.badRequest('Пользователь, услуга и сумма обязательны'));
            }

            // Проверяем существование пользователя
            const user = await User.findOne({ where: { id: user_id } });
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            // Проверяем существование услуги
            const service = await Service.findOne({ where: { id: service_id, is_active: true } });
            if (!service) {
                return next(ApiError.badRequest('Услуга не найдена или деактивирована'));
            }

            const invoice = await Invoice.create({
                user_id,
                service_id,
                amount,
                description: description || `Услуга: ${service.name}`,
                type: type || service.type,
                due_date: due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней по умолчанию
                status: 'pending'
            });

            return res.json({ invoice, message: 'Счет создан успешно' });

        } catch (error) {
            console.error('Ошибка создания счета:', error);
            return next(ApiError.internal('Ошибка при создании счета'));
        }
    }

    async getUserInvoices(req, res, next) {
        try {
            const userId = req.user.id;

            const invoices = await Invoice.findAll({
                where: { user_id: userId },
                include: [{
                    model: Service,
                    attributes: ['name', 'description']
                }],
                order: [['created_at', 'DESC']]
            });

            return res.json(invoices);

        } catch (error) {
            console.error('Ошибка получения счетов пользователя:', error);
            return next(ApiError.internal('Ошибка при получении счетов'));
        }
    }

    async getAllInvoices(req, res, next) {
        try {
            // Только администратор может видеть все счета
            if (req.user.role !== 'ADMIN') {
                return next(ApiError.forbidden('Доступ запрещен'));
            }

            const invoices = await Invoice.findAll({
                include: [
                    {
                        model: User,
                        attributes: ['id', 'email', 'domain', 'server_ip']
                    },
                    {
                        model: Service,
                        attributes: ['name', 'description']
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            return res.json(invoices);

        } catch (error) {
            console.error('Ошибка получения всех счетов:', error);
            return next(ApiError.internal('Ошибка при получении счетов'));
        }
    }

    async payInvoice(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const invoice = await Invoice.findOne({
                where: { id, user_id: userId },
                include: [User]
            });

            if (!invoice) {
                return next(ApiError.badRequest('Счет не найден'));
            }

            if (invoice.status === 'paid') {
                return next(ApiError.badRequest('Счет уже оплачен'));
            }

            if (invoice.status === 'cancelled') {
                return next(ApiError.badRequest('Счет отменен'));
            }

            // Проверяем достаточность баланса
            if (parseFloat(invoice.User.balance) < parseFloat(invoice.amount)) {
                return next(ApiError.badRequest('Недостаточно средств на балансе'));
            }

            // Списываем средства с баланса
            const newBalance = parseFloat(invoice.User.balance) - parseFloat(invoice.amount);
            await invoice.User.update({ balance: newBalance });

            // Обновляем статус счета
            await invoice.update({
                status: 'paid',
                paid_at: new Date()
            });

            return res.json({ 
                invoice, 
                newBalance,
                message: 'Счет успешно оплачен' 
            });

        } catch (error) {
            console.error('Ошибка оплаты счета:', error);
            return next(ApiError.internal('Ошибка при оплате счета'));
        }
    }

    async cancelInvoice(req, res, next) {
        try {
            const { id } = req.params;

            // Только администратор может отменять счета
            if (req.user.role !== 'ADMIN') {
                return next(ApiError.forbidden('Доступ запрещен'));
            }

            const invoice = await Invoice.findOne({ where: { id } });
            if (!invoice) {
                return next(ApiError.badRequest('Счет не найден'));
            }

            if (invoice.status === 'paid') {
                return next(ApiError.badRequest('Нельзя отменить оплаченный счет'));
            }

            await invoice.update({ status: 'cancelled' });

            return res.json({ invoice, message: 'Счет отменен' });

        } catch (error) {
            console.error('Ошибка отмены счета:', error);
            return next(ApiError.internal('Ошибка при отмене счета'));
        }
    }

    async getStatistics(req, res, next) {
        try {
            // Только администратор может видеть статистику
            if (req.user.role !== 'ADMIN') {
                return next(ApiError.forbidden('Доступ запрещен'));
            }

            const totalUsers = await User.count();
            const totalServices = await Service.count({ where: { is_active: true } });
            const totalInvoices = await Invoice.count();
            const pendingInvoices = await Invoice.count({ where: { status: 'pending' } });
            const paidInvoices = await Invoice.count({ where: { status: 'paid' } });
            
            const totalRevenue = await Invoice.sum('amount', { where: { status: 'paid' } }) || 0;
            
            const monthlyRevenue = await Invoice.sum('amount', { 
                where: { 
                    status: 'paid',
                    paid_at: {
                        [require('sequelize').Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            }) || 0;

            return res.json({
                totalUsers,
                totalServices,
                totalInvoices,
                pendingInvoices,
                paidInvoices,
                totalRevenue: parseFloat(totalRevenue),
                monthlyRevenue: parseFloat(monthlyRevenue)
            });

        } catch (error) {
            console.error('Ошибка получения статистики:', error);
            return next(ApiError.internal('Ошибка при получении статистики'));
        }
    }
}

module.exports = { ServiceController, InvoiceController };