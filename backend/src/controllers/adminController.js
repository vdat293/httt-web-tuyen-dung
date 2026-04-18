const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const SavedJob = require('../models/SavedJob');
const OTPCode = require('../models/OTPCode');
const { createNotification } = require('./notificationController');

// ── Dashboard ────────────────────────────────────────────────────────

const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCandidates,
      totalEmployers,
      totalJobs,
      totalApplications,
      totalInterviews,
      pendingJobs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'employer' }),
      Job.countDocuments(),
      Application.countDocuments(),
      Interview.countDocuments(),
      Job.countDocuments({ status: 'pending' }),
    ]);

    // Applications by status
    const statusBreakdown = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusMap = {};
    statusBreakdown.forEach(({ _id, count }) => { statusMap[_id] = count; });

    // Jobs by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const jobsByMonth = await Job.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Applications by month
    const applicationsByMonth = await Application.aggregate([
      { $match: { appliedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$appliedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top employers by job count
    const topEmployers = await Job.aggregate([
      { $group: { _id: '$employerId', jobCount: { $sum: 1 } } },
      { $sort: { jobCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employer',
        },
      },
      { $unwind: '$employer' },
      {
        $project: {
          _id: 1,
          jobCount: 1,
          name: '$employer.name',
          companyLogo: '$employer.companyLogo',
        },
      },
    ]);

    // Recent pending jobs
    const recentPendingJobs = await Job.find({ status: 'pending' })
      .populate('employerId', 'name companyLogo')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalCandidates,
        totalEmployers,
        totalJobs,
        totalApplications,
        totalInterviews,
        pendingJobs,
      },
      statusBreakdown: {
        pending: statusMap.pending || 0,
        reviewed: statusMap.reviewed || 0,
        interview: statusMap.interview || 0,
        accepted: statusMap.accepted || 0,
        rejected: statusMap.rejected || 0,
      },
      jobsByMonth,
      applicationsByMonth,
      topEmployers,
      recentPendingJobs,
    });
  } catch (error) {
    next(error);
  }
};

// ── Users ────────────────────────────────────────────────────────────

const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20, status } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (isActive !== undefined) user.isActive = isActive;
    if (req.body.name) user.name = req.body.name;
    if (req.body.role) user.role = req.body.role;

    await user.save();
    res.json({ message: 'User updated', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Cascade delete related data
    if (user.role === 'candidate') {
      await Application.deleteMany({ candidateId: user._id });
      await SavedJob.deleteMany({ user: user._id });
    } else if (user.role === 'employer') {
      const employerJobs = await Job.find({ employerId: user._id }).select('_id');
      const jobIds = employerJobs.map((j) => j._id);
      await Application.deleteMany({ jobId: { $in: jobIds } });
      await Job.deleteMany({ employerId: user._id });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ── Jobs ─────────────────────────────────────────────────────────────

const getAllJobs = async (req, res, next) => {
  try {
    const { status, employerId, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (employerId) filter.employerId = employerId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('employerId', 'name companyLogo email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(filter),
    ]);

    res.json({ jobs, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    next(error);
  }
};

const approveJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.status = 'open';
    await job.save();

    // Thông báo cho nhà tuyển dụng tin đã được duyệt
    await createNotification({
      user: job.employerId,
      type: 'job_approved',
      title: 'Tin tuyển dụng đã được duyệt',
      message: `Tin tuyển dụng "${job.title}" của bạn đã được quản trị viên duyệt và đang hiển thị công khai`,
      data: { jobId: job._id },
      io: req.io,
    });

    res.json({ message: 'Job approved', job });
  } catch (error) {
    next(error);
  }
};

const rejectJob = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.status = 'rejected';
    job.rejectReason = reason || '';
    await job.save();

    // Thông báo cho nhà tuyển dụng tin bị từ chối
    await createNotification({
      user: job.employerId,
      type: 'job_rejected',
      title: 'Tin tuyển dụng bị từ chối',
      message: `Tin tuyển dụng "${job.title}" đã bị từ chối${reason ? `: ${reason}` : ''}`,
      data: { jobId: job._id },
      io: req.io,
    });

    res.json({ message: 'Job rejected', job });
  } catch (error) {
    next(error);
  }
};

// ── Reports ──────────────────────────────────────────────────────────

const getReports = async (req, res, next) => {
  try {
    // Users growth (last 12 months)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const usersByMonth = await User.aggregate([
      { $match: { createdAt: { $gte: oneYearAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Jobs by industry/location
    const jobsByLocation = await Job.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Applications by status
    const appsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Top skills demanded
    const allJobs = await Job.find({}).select('skills');
    const skillMap = {};
    allJobs.forEach((job) => {
      (job.skills || []).forEach((skill) => {
        skillMap[skill] = (skillMap[skill] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Application rate by month
    const appsByMonth = await Application.aggregate([
      { $match: { appliedAt: { $gte: oneYearAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$appliedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Jobs by type
    const jobsByType = await Job.aggregate([
      { $group: { _id: '$jobType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      usersByMonth,
      jobsByLocation,
      appsByStatus,
      topSkills,
      appsByMonth,
      jobsByType,
    });
  } catch (error) {
    next(error);
  }
};

// ── OTPs ─────────────────────────────────────────────────────────────

const getAllOTPs = async (req, res, next) => {
  try {
    const { email, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (type) filter.type = type;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [otps, total] = await Promise.all([
      OTPCode.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      OTPCode.countDocuments(filter),
    ]);

    res.json({ otps, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  updateUser,
  deleteUser,
  getAllJobs,
  approveJob,
  rejectJob,
  getReports,
  getAllOTPs,
};
