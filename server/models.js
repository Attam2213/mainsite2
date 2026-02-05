const sequelize = require('./db');
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

const Invoice = sequelize.define('invoice', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    service_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'paid', 'cancelled'), defaultValue: 'pending' },
    type: { type: DataTypes.ENUM('monthly', 'one-time'), defaultValue: 'one-time' },
    description: { type: DataTypes.TEXT },
    due_date: { type: DataTypes.DATE },
    paid_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Chat = sequelize.define('chat', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'closed'), defaultValue: 'active' },
    subject: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Message = sequelize.define('message', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chat_id: { type: DataTypes.INTEGER, allowNull: false },
    sender_id: { type: DataTypes.INTEGER, allowNull: false },
    sender_type: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
    content: { type: DataTypes.TEXT, allowNull: false },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const ChatFile = sequelize.define('chat_file', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    message_id: { type: DataTypes.INTEGER, allowNull: false },
    filename: { type: DataTypes.STRING, allowNull: false },
    original_name: { type: DataTypes.STRING, allowNull: false },
    file_type: { type: DataTypes.STRING },
    file_size: { type: DataTypes.INTEGER },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// Связи между моделями
User.hasMany(Invoice, { foreignKey: 'user_id' });
Invoice.belongsTo(User, { foreignKey: 'user_id' });

Service.hasMany(Invoice, { foreignKey: 'service_id' });
Invoice.belongsTo(Service, { foreignKey: 'service_id' });

User.hasMany(Chat, { foreignKey: 'user_id' });
Chat.belongsTo(User, { foreignKey: 'user_id' });

Chat.hasMany(Message, { foreignKey: 'chat_id' });
Message.belongsTo(Chat, { foreignKey: 'chat_id' });

Message.hasMany(ChatFile, { foreignKey: 'message_id' });
ChatFile.belongsTo(Message, { foreignKey: 'message_id' });

module.exports = { User, Portfolio, Service, Invoice, Chat, Message, ChatFile };
