const chatbotService = require('./chatbot.service');
const ChatSession = require('../../models/chatSession.model');
const { success, error } = require('../../utils/response');

// SEND MESSAGE

const sendMessage = async (req, res, next) => {
    try {
        const { sessionId, message } = req.body;

        // Validate that both fields are present
        if (!sessionId || !message) {
            return error(res, 'sessionId and message are required', 400, 'VALIDATION_ERROR');
        }

        const reply = await chatbotService.sendMessage(sessionId, message);
        return success(res, { sessionId, reply }, 'Message sent');
    } catch (err) {
        next(err);
    }
};

// NEW SESSION

const newSession = async (req, res, next) => {
    try {
        // Mark all existing sessions as inactive
        await ChatSession.updateMany(
            { userId: req.user.userId },
            { active: false }
        );

        // Create a fresh session for this learner
        const session = await ChatSession.create({
            userId: req.user.userId,
            history: [],
            active: true
        });

        return success(res, { sessionId: session._id }, 'New session started');
    } catch (err) {
        next(err);
    }
};

// GET HISTORY

const getHistory = async (req, res, next) => {
    try {
        // Find the current active session for this learner
        const session = await ChatSession.findOne({
            userId: req.user.userId,
            active: true
        });

        if (!session) {
            return error(res, 'No active session found. Start a new session first.', 404, 'NOT_FOUND');
        }

        return success(res, {
            sessionId: session._id,
            history: session.history
        }, 'History retrieved');
    } catch (err) {
        next(err);
    }
};

// LIST SESSIONS

const getSessions = async (req, res, next) => {
    try {
        // Get all sessions for this learner, newest first
        // Only return id, title, active status and timestamps — not full history
        const sessions = await ChatSession.find({ userId: req.user.userId })
            .select('_id title active createdAt updatedAt')
            .sort({ createdAt: -1 });

        return success(res, { sessions }, 'Sessions retrieved');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    sendMessage,
    newSession,
    getHistory,
    getSessions
};