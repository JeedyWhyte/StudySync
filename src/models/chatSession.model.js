const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    messages: [
        {
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            content: {
                type: String,
                required: true
            }
        }
    ]
});

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
module.exports = ChatSession;