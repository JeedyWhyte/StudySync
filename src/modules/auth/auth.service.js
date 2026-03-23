const User = require('../../models/user.model');
const { hash, compare } = require('../../utils/hash');
const { signToken, signRefresh, verify } = require('../../utils/jwt');
const { sendEmail } = require('../../utils/email');
const crypto = require('crypto');

//  REGISTER 

const register = async ({ name, email, password }) => {
    // Check if email is already taken
    const existing = await User.findOne({ email });
    if (existing) {
        const err = new Error('Email already in use');
        err.status = 409;
        err.code = 'CONFLICT';
        throw err;
    }

    // Hash the password — never store plain text
    const passwordHash = await hash(password);

    // Create the user in MongoDB
    const user = await User.create({
        name,
        email,
        password: passwordHash,
        role: 'learner',
        status: 'active'
    });

    // Generate both tokens
    const accessToken = signToken({ userId: user._id, role: user.role });
    const refreshToken = signRefresh({ userId: user._id, role: user.role });

    // Save refresh token to the user document automatically
    user.refreshToken = refreshToken;
    await user.save();

    return {
        userId: user._id,
        token: accessToken,
        refreshToken
    };
};

//  LOGIN 

const login = async ({ email, password }) => {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        err.code = 'UNAUTHORIZED';
        throw err;
    }

    // Check account is active
    if (user.status === 'suspended') {
        const err = new Error('Account suspended');
        err.status = 403;
        err.code = 'FORBIDDEN';
        throw err;
    }

    // Compare submitted password against stored hash
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        err.code = 'UNAUTHORIZED';
        throw err;
    }

    // Generate both tokens
    const accessToken = signToken({ userId: user._id, role: user.role });
    const refreshToken = signRefresh({ userId: user._id, role: user.role });

    // Save new refresh token to user document automatically
    user.refreshToken = refreshToken;
    await user.save();

    return {
        userId: user._id,
        token: accessToken,
        refreshToken
    };
};

//  REFRESH TOKEN 

const refreshToken = async (token) => {
    // Verify the refresh token signature and expiry
    let payload;
    try {
        payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        const err = new Error('Invalid or expired refresh token');
        err.status = 401;
        err.code = 'UNAUTHORIZED';
        throw err;
    }

    // Find user and check stored token matches what was sent
    // This invalidates old tokens if a new login has happened since
    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== token) {
        const err = new Error('Refresh token is no longer valid');
        err.status = 401;
        err.code = 'UNAUTHORIZED';
        throw err;
    }

    // Issue a fresh access token
    const accessToken = signToken({ userId: user._id, role: user.role });

    return { token: accessToken };
};

//  LOGOUT 

const logout = async (userId) => {
    // Clear the stored refresh token — invalidates all future refresh attempts
    await User.findByIdAndUpdate(userId, { refreshToken: null });
};

//  FORGOT PASSWORD 

const forgotPassword = async (email) => {
    const user = await User.findOne({ email });

    // Always return success even if email not found
    // This prevents attackers from knowing which emails are registered
    if (!user) return;

    // Generate a secure random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await hash(resetToken);

    // Save hashed token and 1 hour expiry to user document
    user.resetToken = resetTokenHash;
    user.resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Send the plain token in the email link — only the hash is stored
    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}&email=${email}`;

    await sendEmail({
        to: email,
        subject: 'Reset your StudySync password',
        html: `<p>Click the link below to reset your password. It expires in 1 hour.</p>
               <a href="${resetLink}">${resetLink}</a>`
    });
};

//  RESET PASSWORD 

const resetPassword = async ({ token, newPassword, email }) => {
    const user = await User.findOne({
        email,
        resetTokenExpiresAt: { $gt: new Date() } // token must not be expired
    });

    if (!user) {
        const err = new Error('Invalid or expired reset token');
        err.status = 400;
        err.code = 'BAD_REQUEST';
        throw err;
    }

    // Compare submitted token against stored hash
    const isValid = await compare(token, user.resetToken);
    if (!isValid) {
        const err = new Error('Invalid or expired reset token');
        err.status = 400;
        err.code = 'BAD_REQUEST';
        throw err;
    }

    // Hash new password and clear reset token fields
    user.password = await hash(newPassword);
    user.resetToken = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save();
};

//  SET PASSWORD (lecturer invite flow) 

const setPassword = async ({ token, password }) => {
    // Verify the invite token
    let payload;
    try {
        payload = verify(token, process.env.JWT_SECRET);
    } catch {
        const err = new Error('Invalid or expired invite link');
        err.status = 400;
        err.code = 'BAD_REQUEST';
        throw err;
    }

    const user = await User.findById(payload.userId);

    // Check invite token matches and has not been used already
    if (!user || user.inviteToken !== token || user.status !== 'invited') {
        const err = new Error('Invalid or expired invite link');
        err.status = 400;
        err.code = 'BAD_REQUEST';
        throw err;
    }

    // Set the password, activate the account, clear the invite token
    user.password = await hash(password);
    user.status = 'active';
    user.inviteToken = undefined;
    user.inviteExpiresAt = undefined;
    await user.save();
};

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword,
    setPassword
};