const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    requirements: {
      type: String,
      required: [true, 'Requirements are required'],
    },
    benefits: {
      type: String,
      required: false,
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      default: 'full-time',
    },
    experience: {
      type: String,
      enum: ['intern', 'fresher', 'junior', 'senior', 'manager'],
      default: 'fresher',
    },
    level: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'rejected'],
      default: 'open',
    },
    category: {
      type: String,
      default: '',
    },
    deadline: {
      type: Date,
      required: false,
    },
    rejectReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ employerId: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);
