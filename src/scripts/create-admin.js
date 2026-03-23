const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/user.model');
const { hash } = require('../utils/hash');

const createAdmin = async () => {
    await connectDB();

    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;

    // Make sure the env vars exist before running
    if (!email || !password) {
        console.error('❌ SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env');
        process.exit(1);
    }

    // Check if admin already exists — never create duplicates
    const existing = await User.findOne({ email });
    if (existing) {
        console.log('⚠️  Admin already exists — skipping');
        await mongoose.disconnect();
        process.exit(0);
    }

    await User.create({
        name: 'Admin',
        email,
        password: await hash(password),
        role: 'admin',
        status: 'active'
    });

    console.log(`✅ Admin account created: ${email}`);
    console.log('⚠️  Now delete SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD from your .env');

    await mongoose.disconnect();
    process.exit(0);
};

createAdmin().catch((err) => {
    console.error('Failed to create admin:', err.message);
    process.exit(1);
});