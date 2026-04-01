const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true
  },
  category: String,
  tags: [String],
  thumbnailUrl: String,
  offlineAvailable: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  rejectionReason: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  enrollmentCount: { type: Number, default: 0 },
  modules: [{
    title: String,
    durationMins: Number,
    // resourceUrl: String,    // external link — YouTube, Google Drive, etc.
    videoUrl: String    //direct video to cloudinary
  }]
},
  {
    timestamps: true
  });

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;