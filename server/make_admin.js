require('dotenv').config();
const { User } = require('./models');
const sequelize = require('./db');

const email = process.argv[2];

if (!email) {
    console.log('Usage: node make_admin.js <email>');
    process.exit(1);
}

const makeAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log(`User with email ${email} not found`);
            process.exit(1);
        }

        user.role = 'ADMIN';
        await user.save();
        console.log(`SUCCESS: User ${email} is now ADMIN`);
    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await sequelize.close();
    }
};

makeAdmin();
