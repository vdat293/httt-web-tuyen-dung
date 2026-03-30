const Application = require('../models/Application');
const Job = require('../models/Job');
const { parseCVWithLLM } = require('../services/cvParser');
const fs = require('fs');
const path = require('path');

const getApplications = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'employer') {
      // Get jobs owned by employer
      const employerJobs = await Job.find({ employerId: req.user._id }).select('_id');
      const jobIds = employerJobs.map((j) => j._id);
      filter.jobId = { $in: jobIds };
    } else {
      filter.candidateId = req.user._id;
    }

    const { jobId, status, skills } = req.query;
    if (jobId) filter.jobId = jobId;
    if (status) filter.status = status;

    let applications = await Application.find(filter)
      .populate('jobId', 'title location salary jobType')
      .populate('candidateId', 'name email phone')
      .sort({ appliedAt: -1 });

    // Filter by skills if requested
    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim().toLowerCase());
      applications = applications.filter((app) => {
        if (!app.parsedCV || !app.parsedCV.skills) return false;
        const appSkills = app.parsedCV.skills.map((s) => s.toLowerCase());
        return skillList.some((s) => appSkills.includes(s));
      });
    }

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('candidateId', 'name email phone');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check authorization
    if (
      req.user.role === 'employer' &&
      application.jobId.employerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.user.role === 'candidate' && application.candidateId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

const createApplication = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    const candidateId = req.user._id;

    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existing = await Application.findOne({ jobId, candidateId });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    let parsedCV = { skills: [], experience: '', education: '' };
    let cvUrl = '';

    if (req.file) {
      cvUrl = `/uploads/${req.file.filename}`;

      // Read the CV file and parse with LLM
      const cvPath = path.join(__dirname, '../../uploads', req.file.filename);
      try {
        const cvText = fs.readFileSync(cvPath, 'utf-8');
        parsedCV = await parseCVWithLLM(cvText);
      } catch (err) {
        console.error('Error reading CV file:', err.message);
        // Continue without parsed CV data
      }
    }

    const application = await Application.create({
      jobId,
      candidateId,
      cvUrl,
      parsedCV,
      status: 'pending',
    });

    const populated = await Application.findById(application._id)
      .populate('jobId', 'title location')
      .populate('candidateId', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (
      req.user.role !== 'employer' ||
      application.jobId.employerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus,
};
