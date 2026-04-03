const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['learner', 'lecturer', 'admin'],
    default: 'learner'
  },
  status: {
    type: String,
    enum: ['active', 'invited', 'suspended'],
    default: 'active',
  },
  onboarding: {
    course: String,
    learningIntent: String,
    currentLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    complete: { type: Boolean, default: false },
    schedule: {
      hoursPerDay: { type: Number },        // e.g. 1, 2, 3
      daysPerWeek: { type: Number },        // e.g. 3, 5, 7
      preferredTime: { type: String, enum: ['morning', 'afternoon', 'evening'] }
    },
  },
  profile: {
    phone: { type: String },
    bio: { type: String },
    university: { type: String },   // learner field
    course: { type: String },   // learner's programme/course of study
    institution: { type: String },   // lecturer field
    expertise: { type: String },   // lecturer field
    avatar: { type: String },   // Cloudinary URL — both roles
  },
  refreshToken: String,
  resetToken: String,
  resetTokenExpiresAt: Date,
  inviteToken: String,
  inviteExpiresAt: Date,
});

const User = mongoose.model("User", userSchema);
module.exports = User;