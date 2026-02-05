const { User } = require('../models');
const ApiError = require('../error/ApiError');

class UserController {
    async getProfile(req, res, next) {
        try {
            console.log('Запрос профиля, req.user:', req.user);
            
            const user = await User.findOne({ 
                where: { id: req.user.id },
                attributes: { exclude: ['password'] }
            });

            console.log('Профиль пользователя:', user);

            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            return res.json(user);

        } catch (error) {
            console.error('Ошибка получения профиля:', error);
            return next(ApiError.internal('Ошибка при получении профиля'));
        }
    }

    async updateProfile(req, res, next) {
        try {
            const { userId, domain, server_ip } = req.body;
            const currentUserId = req.user.id;
            const currentUserRole = req.user.role;

            // Определяем целевого пользователя (если не указан, используем текущего)
            const targetUserId = userId || currentUserId;

            // Проверяем права доступа
            if (currentUserRole !== 'ADMIN' && targetUserId !== currentUserId) {
                return next(ApiError.forbidden('Только администратор может изменять настройки других пользователей'));
            }

            const user = await User.findOne({ where: { id: targetUserId } });
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            // Обновляем только разрешенные поля
            await user.update({
                domain: domain !== undefined ? domain : user.domain,
                server_ip: server_ip !== undefined ? server_ip : user.server_ip
            });

            // Возвращаем обновленного пользователя без пароля
            const updatedUser = await User.findOne({ 
                where: { id: targetUserId },
                attributes: { exclude: ['password'] }
            });

            return res.json(updatedUser);

        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            return next(ApiError.internal('Ошибка при обновлении профиля'));
        }
    }

    async topUpBalance(req, res, next) {
        try {
            const { amount } = req.body;
            const userId = req.user.id;

            if (!amount || amount <= 0) {
                return next(ApiError.badRequest('Сумма пополнения должна быть больше 0'));
            }

            const user = await User.findOne({ where: { id: userId } });
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            // Пополняем баланс
            const newBalance = parseFloat(user.balance) + parseFloat(amount);
            await user.update({ balance: newBalance });

            // Возвращаем обновленного пользователя без пароля
            const updatedUser = await User.findOne({ 
                where: { id: userId },
                attributes: { exclude: ['password'] }
            });

            return res.json({ 
                user: updatedUser, 
                message: `Баланс успешно пополнен на ${amount} руб.` 
            });

        } catch (error) {
            console.error('Ошибка пополнения баланса:', error);
            return next(ApiError.internal('Ошибка при пополнении баланса'));
        }
    }

    async getAllUsers(req, res, next) {
        try {
            // Проверяем, является ли пользователь администратором
            if (req.user.role !== 'ADMIN') {
                return next(ApiError.forbidden('Доступ запрещен'));
            }

            const users = await User.findAll({
                attributes: { exclude: ['password'] },
                order: [['id', 'ASC']]
            });

            return res.json(users);

        } catch (error) {
            console.error('Ошибка получения списка пользователей:', error);
            return next(ApiError.internal('Ошибка при получении списка пользователей'));
        }
    }

    async createYooMoneyPayment(req, res, next) {
        try {
            const { amount } = req.body;
            const userId = req.user.id;

            if (!amount || amount <= 0) {
                return next(ApiError.badRequest('Сумма платежа должна быть больше 0'));
            }

            // Подготовка данных для YooMoney API
            const paymentData = {
                amount: {
                    value: amount.toFixed(2),
                    currency: 'RUB'
                },
                confirmation: {
                    type: 'redirect',
                    return_url: `${process.env.CLIENT_URL}/payment-status?status=success`
                },
                capture: true,
                description: `Пополнение баланса пользователя ${userId}`,
                metadata: {
                    userId: userId
                }
            };

            // Здесь будет интеграция с YooMoney API
            // Пока возвращаем заглушку с тестовыми данными
            const mockPayment = {
                id: 'test-payment-' + Date.now(),
                status: 'pending',
                amount: paymentData.amount,
                confirmation: {
                    type: 'redirect',
                    confirmation_url: 'https://yoomoney.ru/test-payment'
                },
                created_at: new Date().toISOString(),
                description: paymentData.description
            };

            return res.json({
                payment: mockPayment,
                message: 'Платеж создан успешно. Используйте confirmation_url для оплаты.'
            });

        } catch (error) {
            console.error('Ошибка создания платежа YooMoney:', error);
            return next(ApiError.internal('Ошибка при создании платежа'));
        }
    }

    async handleYooMoneyWebhook(req, res, next) {
        try {
            const { object: payment } = req.body;
            
            if (!payment) {
                return res.status(400).json({ message: 'Нет данных о платеже' });
            }

            // Проверяем статус платежа
            if (payment.status === 'succeeded') {
                const userId = payment.metadata?.userId;
                const amount = payment.amount?.value;

                if (!userId || !amount) {
                    console.error('Отсутствуют необходимые данные в webhook:', { userId, amount });
                    return res.status(400).json({ message: 'Отсутствуют необходимые данные' });
                }

                // Находим пользователя и пополняем баланс
                const user = await User.findOne({ where: { id: userId } });
                if (!user) {
                    console.error('Пользователь не найден:', userId);
                    return res.status(404).json({ message: 'Пользователь не найден' });
                }

                const newBalance = parseFloat(user.balance) + parseFloat(amount);
                await user.update({ balance: newBalance });

                console.log(`Баланс пользователя ${userId} успешно пополнен на ${amount} руб. Новый баланс: ${newBalance}`);
                
                return res.status(200).json({ message: 'Баланс успешно пополнен' });
            }

            // Если платеж не успешен, просто возвращаем OK
            return res.status(200).json({ message: 'Платеж обработан' });

        } catch (error) {
            console.error('Ошибка обработки webhook YooMoney:', error);
            return res.status(500).json({ message: 'Ошибка обработки платежа' });
        }
    }
}

module.exports = new UserController();