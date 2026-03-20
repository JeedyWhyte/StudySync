const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['course_approved', 'course_rejected', 'student_completed', 'deadline_reminder'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    meta: {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;