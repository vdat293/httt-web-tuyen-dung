const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

// GET /api/saved-jobs — list all saved jobs for current user
const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(savedJobs);
  } catch (error) {
    next(error);
  }
};

// POST /api/saved-jobs/:jobId — save a job
const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check already saved
    const existing = await SavedJob.findOne({ user: req.user._id, job: jobId });
    if (existing) return res.status(400).json({ message: 'Job already saved' });

    const savedJob = await SavedJob.create({ user: req.user._id, job: jobId });
    await savedJob.populate({
      path: 'job',
      select: 'title location salary jobType skills experience employerId views',
      populate: { path: 'employerId', select: 'name companyLogo' },
    });

    res.status(201).json(savedJob);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/saved-jobs/:jobId — unsave a job
const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const savedJob = await SavedJob.findOneAndDelete({ user: req.user._id, job: jobId });

    if (!savedJob) return res.status(404).json({ message: 'Saved job not found' });

    res.json({ message: 'Job removed from saved list' });
  } catch (error) {
    next(error);
  }
};

// GET /api/saved-jobs/:jobId/is-saved — check if a job is saved
const isJobSaved = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const saved = await SavedJob.findOne({ user: req.user._id, job: jobId });
    res.json({ saved: !!saved });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSavedJobs, saveJob, unsaveJob, isJobSaved };
