const mongoose = require("mongoose");

const pathSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['generating', 'ready', 'failed'], default: 'generating' },
    estimatedWeeks: Number,       // e.g. 12
    weeklyHours: Number,          // e.g. 10
    summary: String,              // e.g. "Complete Python for Data Science in 12 weeks"
    stages: [{
        order: Number,
        title: String,
        description: String,
        estimatedWeeks: Number,
        hoursRequired: Number,
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        status: { type: String, enum: ['locked', 'active', 'completed'], default: 'locked' },
        deadline: Date
    }],
    generatedAt: Date
}, { timestamps: true });

const Path = mongoose.model("Path", pathSchema);
module.exports = Path;