const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');

const {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    setPasswordSchema
} = require('./auth.schema');

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/set-password', validate(setPasswordSchema), authController.setPassword);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// ─── PROTECTED ROUTES ─────────────────────────────────────────────────────────

router.post('/logout', authenticate, authController.logout);

module.exports = router;