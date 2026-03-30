const Job = require('../models/Job');
const Application = require('../models/Application');

const getJobs = async (req, res, next) => {
  try {
    const { title, location, skills, jobType, status } = req.query;
    const filter = {};

    if (title) {
      filter.$or = [
        { title: { $regex: title, $options: 'i' } },
        { description: { $regex: title, $options: 'i' } },
      ];
    }
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim());
      filter.skills = { $in: skillList };
    }
    if (jobType) filter.jobType = jobType;
    if (status) filter.status = status;
    else filter.status = 'open'; // default to open jobs

    const jobs = await Job.find(filter)
      .populate('employerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('employerId', 'name email phone');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const applicationCount = await Application.countDocuments({ jobId: job._id });

    // Fetch related jobs by same location (excluding current job)
    const relatedJobs = await Job.find({
      location: job.location,
      _id: { $ne: job._id },
      status: 'open',
    })
      .populate('employerId', 'name')
      .limit(4)
      .sort({ createdAt: -1 });

    res.json({ ...job.toObject(), applicationCount, relatedJobs });
  } catch (error) {
    next(error);
  }
};

const createJob = async (req, res, next) => {
  try {
    const { title, description, requirements, benefits, salary, location, jobType, skills } = req.body;

    const job = await Job.create({
      employerId: req.user._id,
      title,
      description,
      requirements,
      benefits: benefits || '',
      salary,
      location,
      jobType,
      skills: skills || [],
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedJob);
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    await Application.deleteMany({ jobId: job._id });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs };
