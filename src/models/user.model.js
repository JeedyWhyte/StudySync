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
    complete: { type: Boolean, default: false }
  },
  inviteToken: String,
  inviteExpiresAt: Date,
});

const User = mongoose.model("User", userSchema);
module.exports = User;