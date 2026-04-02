const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job is required'],
    },
  },
  { timestamps: true }
);

// Prevent duplicate saves
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

// Auto-populate job details when querying
savedJobSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'job',
    select: 'title location salary jobType skills experience employerId views',
    populate: { path: 'employerId', select: 'name companyLogo' },
  });
  next();
});

module.exports = mongoose.model('SavedJob', savedJobSchema);
