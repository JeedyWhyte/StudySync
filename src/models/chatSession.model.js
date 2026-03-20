const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: String,
    history: [{
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    active: { type: Boolean, default: true }
}, { timestamps: true });

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
module.exports = ChatSession;