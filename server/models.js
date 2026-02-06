let sequelize;

// Импортируем sequelize динамически
if (typeof window === 'undefined') {
    // В Node.js окружении
    sequelize = require('./db');
}

const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: 'USER' }, // 'ADMIN', 'USER'
    domain: { type: DataTypes.STRING }, // For client
    server_ip: { type: DataTypes.STRING }, // For client
    balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 }, // User balance
});

const Portfolio = sequelize.define('portfolio', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    image: { type: DataTypes.STRING },
    link: { type: DataTypes.STRING }
});

const Service = sequelize.define('service', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    description: { type: DataTypes.TEXT },
    type: { type: DataTypes.ENUM('monthly', 'one-time'), defaultValue: 'one-time' }, // Тип оплаты
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Message = sequelize.define('message', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chat_id: { type: DataTypes.INTEGER, allowNull: false },
    sender_id: { type: DataTypes.INTEGER, allowNull: false },
    sender_type: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
    receiver_id: { type: DataTypes.INTEGER, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const ChatFile = sequelize.define('chat_file', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    filename: { type: DataTypes.STRING, allowNull: false },
    original_name: { type: DataTypes.STRING, allowNull: false },
    mimetype: { type: DataTypes.STRING, allowNull: false },
    size: { type: DataTypes.INTEGER, allowNull: false },
    path: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Chat = sequelize.define('chat', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    admin_id: { type: DataTypes.INTEGER, allowNull: true },
    subject: { type: DataTypes.STRING, defaultValue: 'Техническая поддержка' },
    status: { type: DataTypes.ENUM('active', 'closed'), defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Payment = sequelize.define('payment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: 'RUB' },
    status: { type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'), defaultValue: 'pending' },
    payment_method: { type: DataTypes.STRING, allowNull: false }, // 'yoomoney', 'sberbank', etc.
    payment_id: { type: DataTypes.STRING }, // ID от платежной системы
    description: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Invoice = sequelize.define('invoice', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    service_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    description: { type: DataTypes.TEXT },
    type: { type: DataTypes.ENUM('monthly', 'one-time'), defaultValue: 'one-time' },
    status: { type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'overdue'), defaultValue: 'pending' },
    due_date: { type: DataTypes.DATE },
    paid_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// Связи
User.hasMany(Portfolio);
Portfolio.belongsTo(User);

User.hasMany(Message);
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

User.hasMany(Chat);
Chat.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Chat.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });
Chat.hasMany(Message, { foreignKey: 'chat_id' });
Message.belongsTo(Chat, { foreignKey: 'chat_id' });

Message.hasMany(ChatFile, { foreignKey: 'message_id', as: 'files' });
ChatFile.belongsTo(Message, { foreignKey: 'message_id' });

User.hasMany(Payment);
Payment.belongsTo(User);

User.hasMany(Invoice);
Invoice.belongsTo(User);

Service.hasMany(Invoice);
Invoice.belongsTo(Service);

module.exports = {
    User,
    Portfolio,
    Service,
    Message,
    ChatFile,
    Chat,
    Payment,
    Invoice
};