const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

const getJobs = async (req, res, next) => {
  try {
    const {
      q,
      location,
      jobType,
      experience,
      salaryMin,
      salaryMax,
      category,
      skills,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (category) {
      filter.category = category;
    }
    if (jobType) filter.jobType = jobType;
    if (experience) filter.experience = experience;
    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillList.length) filter.skills = { $in: skillList };
    }
    if (salaryMin !== undefined || salaryMax !== undefined) {
      const min = Number(salaryMin);
      const max = Number(salaryMax);

      if (min === -1 || max === -1) {
        // Special case for "Negotiation" if needed, 
        // but for now let's just handle it as a range check if values are -1
        // Usually, negotiation jobs might have salary.min = 0 or something.
      } else {
        // Overlap logic: jobMin <= filterMax AND jobMax >= filterMin
        if (!isNaN(max) && max > 0) filter['salary.min'] = { ...filter['salary.min'], $lte: max };
        if (!isNaN(min) && min > 0) filter['salary.max'] = { ...filter['salary.max'], $gte: min };
      }
    }
    filter.status = 'open';

    const inactiveEmployers = await User.find({ role: 'employer', isActive: false }).select('_id');
    const inactiveIds = inactiveEmployers.map(emp => emp._id);
    if (inactiveIds.length > 0) {
      filter.employerId = { $nin: inactiveIds };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('employerId', 'name email companyLogo')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(filter),
    ]);

    res.json({
      jobs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

const incrementViews = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ views: job.views });
  } catch (error) {
    next(error);
  }
};

const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('employerId', 'name email phone companyLogo isActive');

    if (!job || (job.employerId && job.employerId.isActive === false)) {
      return res.status(404).json({ message: 'Job not found or employer is locked' });
    }

    const applicationCount = await Application.countDocuments({ jobId: job._id });

    const inactiveEmployers = await User.find({ role: 'employer', isActive: false }).select('_id');
    const inactiveIds = inactiveEmployers.map(emp => emp._id);

    // Fetch related jobs by same location (excluding current job)
    const relatedJobs = await Job.find({
      location: job.location,
      _id: { $ne: job._id },
      status: 'open',
      employerId: { $nin: inactiveIds }
    })
      .populate('employerId', 'name companyLogo')
      .limit(4)
      .sort({ createdAt: -1 });

    res.json({ ...job.toObject(), applicationCount, relatedJobs });
  } catch (error) {
    next(error);
  }
};

const createJob = async (req, res, next) => {
  try {
    const { title, description, requirements, benefits, salary, location, jobType, experience, level, skills } = req.body;

    // Support both old string salary and new {min,max} format
    let salaryData = salary;
    if (typeof salary === 'object') {
      salaryData = salary;
    } else {
      salaryData = { min: 0, max: 0 };
    }

    const job = await Job.create({
      employerId: req.user._id,
      title,
      description,
      requirements,
      benefits: benefits || '',
      salary: salaryData,
      location,
      jobType,
      experience: experience || 'fresher',
      level: level || '',
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

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs, incrementViews };
