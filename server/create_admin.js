const {User} = require('./models');
const bcrypt = require('bcryptjs');
const sequelize = require('./db');

const createAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        
        // Sync models to ensure table exists
        await sequelize.sync();

        const email = 'attamcraft@gmail.com';
        const password = 'password123';
        const role = 'ADMIN';

        const candidate = await User.findOne({where: {email}});

        if (candidate) {
            console.log(`User ${email} found. Updating role and password...`);
            candidate.role = role;
            const hashPassword = await bcrypt.hash(password, 5);
            candidate.password = hashPassword;
            await candidate.save();
            console.log(`User ${email} updated successfully.`);
        } else {
            console.log(`User ${email} not found. Creating new admin...`);
            const hashPassword = await bcrypt.hash(password, 5);
            await User.create({email, role, password: hashPassword});
            console.log(`User ${email} created successfully.`);
        }
    } catch (e) {
        console.error('Error creating admin:', e);
    } finally {
        await sequelize.close();
    }
};

createAdmin();
