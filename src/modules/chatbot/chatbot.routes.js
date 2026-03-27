const express = require('express');
const router = express.Router();

const chatbotController = require('./chatbot.controller');
const { authenticate, requireRole } = require('../../middleware/auth');

// ─── ALL CHATBOT ROUTES ARE LEARNER ONLY ─────────────────────────────────────
// Pola is scoped to learners — lecturers and admins cannot access the chatbot

// Send a message to Pola and get a reply
router.post(
    '/message',
    authenticate,
    requireRole('learner'),
    chatbotController.sendMessage
);

// Start a fresh conversation session
router.post(
    '/new-session',
    authenticate,
    requireRole('learner'),
    chatbotController.newSession
);

// Get message history for the current active session
router.get(
    '/history',
    authenticate,
    requireRole('learner'),
    chatbotController.getHistory
);

// List all past sessions for this learner
router.get(
    '/sessions',
    authenticate,
    requireRole('learner'),
    chatbotController.getSessions
);

module.exports = router;