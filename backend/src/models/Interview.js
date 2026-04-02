const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Interview date is required'],
    },
    location: {
      type: String,
      default: 'Online',
    },
    note: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    result: {
      type: String,
      enum: ['passed', 'failed', null],
      default: null,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

interviewSchema.index({ applicationId: 1 });
interviewSchema.index({ scheduledAt: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
