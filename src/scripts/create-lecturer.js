const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);


require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const connectDB = require('../config/db');
const User = require('../models/user.model');
const { sendEmail } = require('../utils/email');

const args = process.argv.slice(2);
const getArg = (flag) => {
    const index = args.indexOf(flag);
    return index !== -1 ? args[index + 1] : null;
};

const createLecturer = async () => {
    await connectDB();

    const name = getArg('--name');
    const email = getArg('--email');

    if (!name || !email) {
        console.error('❌ Usage: node src/scripts/create-lecturer.js --name "Name" --email "email@example.com"');
        process.exit(1);
    }

    const existing = await User.findOne({ email });
    if (existing) {
        console.log(`⚠️  User with email ${email} already exists — skipping`);
        await mongoose.disconnect();
        process.exit(0);
    }

    // Create lecturer first to get the real MongoDB _id
    const lecturer = await User.create({
        name,
        email,
        password: 'INVITE_PENDING',
        role: 'lecturer',
        status: 'invited',
        inviteExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
    });

    // Now generate invite token using the real _id
    const inviteToken = jwt.sign(
        { userId: lecturer._id, role: 'lecturer' },
        process.env.JWT_SECRET,
        { expiresIn: '48h' }
    );

    // Save the token to the lecturer document
    lecturer.inviteToken = inviteToken;
    await lecturer.save();

    // Build and send invite email
    const inviteLink = `${process.env.APP_URL}/set-password?token=${inviteToken}`;

    await sendEmail({
        to: email,
        subject: 'You have been invited to StudySync as a Lecturer',
        html: `
            <h2>Welcome to StudySync, ${name}!</h2>
            <p>You have been invited to join StudySync as a lecturer.</p>
            <p>Click the link below to set your password and activate your account.</p>
            <p>This link expires in 48 hours.</p>
            <a href="${inviteLink}">${inviteLink}</a>
            <p>If you did not expect this email, please ignore it.</p>
        `
    });

    console.log(`✅ Lecturer account created: ${email}`);
    console.log(`✅ Invite email sent to: ${email}`);
    console.log(`🔗 Invite link: ${inviteLink}`);

    await mongoose.disconnect();
    process.exit(0);
};

createLecturer().catch((err) => {
    console.error('Failed to create lecturer:', err.message);
    process.exit(1);
});