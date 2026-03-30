const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Job = require('../models/Job');

const getInterviews = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'employer') {
      // Get applications for employer's jobs
      const employerJobs = await Job.find({ employerId: req.user._id }).select('_id');
      const jobIds = employerJobs.map((j) => j._id);
      const applications = await Application.find({ jobId: { $in: jobIds } }).select('_id');
      const applicationIds = applications.map((a) => a._id);
      filter.applicationId = { $in: applicationIds };
    } else {
      filter.applicationId = { $in: (await Application.find({ candidateId: req.user._id })).map((a) => a._id) };
    }

    const interviews = await Interview.find(filter)
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'jobId', select: 'title' },
          { path: 'candidateId', select: 'name email phone' },
        ],
      })
      .sort({ scheduledAt: 1 });

    res.json(interviews);
  } catch (error) {
    next(error);
  }
};

const createInterview = async (req, res, next) => {
  try {
    const { applicationId, scheduledAt, location, note } = req.body;

    const application = await Application.findById(applicationId).populate('jobId');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Only employer who owns the job can create interview
    if (application.jobId.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const interview = await Interview.create({
      applicationId,
      scheduledAt,
      location: location || 'Online',
      note: note || '',
    });

    // Update application status to interview
    application.status = 'interview';
    await application.save();

    const populated = await Interview.findById(interview._id).populate({
      path: 'applicationId',
      populate: [
        { path: 'jobId', select: 'title' },
        { path: 'candidateId', select: 'name email phone' },
      ],
    });

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

const updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id).populate({
      path: 'applicationId',
      populate: { path: 'jobId', select: 'employerId' },
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.applicationId.jobId.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { scheduledAt, location, note, status, result } = req.body;

    if (scheduledAt) interview.scheduledAt = scheduledAt;
    if (location) interview.location = location;
    if (note !== undefined) interview.note = note;
    if (status) interview.status = status;
    if (result) interview.result = result;

    await interview.save();

    // If interview is completed, update application status based on result
    if (status === 'completed' && result) {
      const application = await Application.findById(interview.applicationId._id);
      application.status = result === 'passed' ? 'accepted' : 'rejected';
      await application.save();
    }

    const updated = await Interview.findById(interview._id).populate({
      path: 'applicationId',
      populate: [
        { path: 'jobId', select: 'title' },
        { path: 'candidateId', select: 'name email phone' },
      ],
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id).populate({
      path: 'applicationId',
      populate: [
        { path: 'jobId', select: 'title employerId' },
        { path: 'candidateId', select: 'name email phone' },
      ],
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    next(error);
  }
};

module.exports = { getInterviews, createInterview, updateInterview, getInterview };
