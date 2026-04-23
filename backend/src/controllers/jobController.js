const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

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

    // Nếu tin chưa được duyệt, chỉ cho phép admin hoặc chính chủ xem
    if (job.status !== 'open') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(404).json({ message: 'Job not found' });
      }

      const token = authHeader.split(' ')[1];
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        const isAdmin = user && user.role === 'admin';
        const isOwner = user && job.employerId._id.toString() === user._id.toString();

        if (!isAdmin && !isOwner) {
          return res.status(404).json({ message: 'Job not found' });
        }
      } catch (err) {
        return res.status(404).json({ message: 'Job not found' });
      }
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
    const { title, description, requirements, benefits, salary, location, jobType, experience, level, skills, category, deadline } = req.body;

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
      category: category || '',
      deadline: deadline || null,
    });

    // Thông báo cho admin có tin mới cần duyệt
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        user: admin._id,
        type: 'new_job_pending',
        title: 'Tin tuyển dụng mới chờ duyệt',
        message: `Nhà tuyển dụng ${req.user.name} vừa đăng tin "${job.title}"`,
        data: { jobId: job._id },
        io: req.io,
      });
    }
    
    if (req.io) {
      req.io.to('admin_room').emit('job_status_updated', { jobId: job._id, status: 'pending' });
    }

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

    // Khi chỉnh sửa tin, đưa trạng thái về 'pending' để duyệt lại nếu:
    // 1. Tin đang bị từ chối
    // 2. Chỉnh sửa các thông tin quan trọng (tiêu đề, mô tả, yêu cầu...) mà không phải chỉ thay đổi trạng thái
    const criticalFields = ['title', 'description', 'requirements', 'benefits', 'salary', 'location', 'skills', 'category'];
    const isEditingCritical = criticalFields.some(field => req.body[field] !== undefined);
    
    let updateData = { ...req.body };
    if (job.status === 'rejected' || isEditingCritical) {
      updateData.status = 'pending';
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // Nếu tin bị reset về pending, thông báo cho admin
    if (updateData.status === 'pending') {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          user: admin._id,
          type: 'new_job_pending',
          title: 'Tin tuyển dụng đã cập nhật & chờ duyệt',
          message: `Tin "${updatedJob.title}" vừa được cập nhật và cần duyệt lại`,
          data: { jobId: updatedJob._id },
          io: req.io,
        });
      }
    }

    if (req.io) {
      req.io.to('admin_room').emit('job_status_updated', { jobId: updatedJob._id, status: updatedJob.status });
      req.io.to(updatedJob.employerId.toString()).emit('job_status_updated', { jobId: updatedJob._id, status: updatedJob.status });
    }

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
