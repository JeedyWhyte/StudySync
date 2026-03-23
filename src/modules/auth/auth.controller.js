const authService = require('./auth.service');
const { success, error } = require('../../utils/response');

//  REGISTER 

const register = async (req, res, next) => {
    try {
        const data = await authService.register(req.body);
        return success(res, data, 'Account created. Please complete onboarding.', 201);
    } catch (err) {
        next(err);
    }
};

//  LOGIN 

const login = async (req, res, next) => {
    try {
        const data = await authService.login(req.body);
        return success(res, data, 'Login successful');
    } catch (err) {
        next(err);
    }
};

//  REFRESH TOKEN 

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const data = await authService.refreshToken(refreshToken);
        return success(res, data, 'Token refreshed');
    } catch (err) {
        next(err);
    }
};

//  LOGOUT 

const logout = async (req, res, next) => {
    try {
        await authService.logout(req.user.userId);
        return success(res, {}, 'Logged out successfully');
    } catch (err) {
        next(err);
    }
};

//  FORGOT PASSWORD 

const forgotPassword = async (req, res, next) => {
    try {
        await authService.forgotPassword(req.body.email);
        return success(res, {}, 'A reset link has been sent to your email');
    } catch (err) {
        next(err);
    }
};

//  RESET PASSWORD 

const resetPassword = async (req, res, next) => {
    try {
        await authService.resetPassword(req.body);
        return success(res, {}, 'Password reset successfully');
    } catch (err) {
        next(err);
    }
};

//  SET PASSWORD (lecturer invite flow) 

const setPassword = async (req, res, next) => {
    try {
        await authService.setPassword(req.body);
        return success(res, {}, 'Password set. You can now log in.');
    } catch (err) {
        next(err);
    }
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