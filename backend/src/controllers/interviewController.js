const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { createNotification } = require('./notificationController');

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

    // Notify candidate of new interview
    const scheduledTime = new Date(scheduledAt).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    await createNotification({
      user: application.candidateId,
      type: 'interview_scheduled',
      title: 'Lịch phỏng vấn mới',
      message: `Bạn có lịch phỏng vấn vị trí "${application.jobId.title}" vào ${scheduledTime}`,
      data: { interviewId: interview._id, applicationId },
      io: req.io,
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

      // Notify candidate of final result
      await createNotification({
        user: interview.applicationId.candidateId,
        type: 'application_status_changed',
        title: result === 'passed' ? 'Chúc mừng! Bạn đã vượt qua phỏng vấn' : 'Kết quả phỏng vấn',
        message: result === 'passed'
          ? `Chúc mừng bạn đã vượt qua phỏng vấn vị trí "${interview.applicationId.jobId.title}"`
          : `Kết quả phỏng vấn vị trí "${interview.applicationId.jobId.title}" đã được cập nhật`,
        data: { applicationId: interview.applicationId._id },
        io: req.io,
      });
    }

    // If time/location changed, notify candidate
    if ((scheduledAt && status !== 'completed') || location) {
      await createNotification({
        user: interview.applicationId.candidateId,
        type: 'interview_scheduled',
        title: 'Cập nhật lịch phỏng vấn',
        message: `Lịch phỏng vấn vị trí "${interview.applicationId.jobId.title}" vừa được cập nhật`,
        data: { interviewId: interview._id },
        io: req.io,
      });
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
