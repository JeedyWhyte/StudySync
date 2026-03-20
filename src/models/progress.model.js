const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    learningPathId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Path'
    },
    completedModules: [String],
    percentComplete: {
        type: Number,
        default: 0
    },
    streakDays: {
        type: Number,
        default: 0
    },
    lastActivityAt: Date
}, { timestamps: true });

const Progress = mongoose.model("Progress", progressSchema);
module.exports = Progress;
