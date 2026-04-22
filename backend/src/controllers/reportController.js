const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const Interview = require('../models/Interview');

const getStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can access reports' });
    }

    const employerJobIds = (await Job.find({ employerId: req.user._id }).select('_id')).map((j) => j._id);

    const [totalJobs, totalApplications, candidates, applications] = await Promise.all([
      Job.countDocuments({ employerId: req.user._id }),
      Application.countDocuments({ jobId: { $in: employerJobIds } }),
      User.countDocuments({ role: 'candidate' }),
      Application.find({ jobId: { $in: employerJobIds } }),
    ]);

    const reviewed = applications.filter((a) => a.status === 'reviewed').length;
    const accepted = applications.filter((a) => a.status === 'accepted').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    const pending = applications.filter((a) => a.status === 'pending').length;
    const interview = applications.filter((a) => a.status === 'interview').length;

    const acceptedRate = totalApplications > 0 ? ((accepted / totalApplications) * 100).toFixed(1) : 0;

    // Count interviews
    const totalInterviews = await Interview.countDocuments({
      applicationId: { $in: applications.map(a => a._id) }
    });

    // Jobs by location
    const jobs = await Job.find({ employerId: req.user._id });
    const locationMap = {};
    jobs.forEach((job) => {
      const loc = job.location;
      locationMap[loc] = (locationMap[loc] || 0) + 1;
    });

    // Top skills from applications
    const skillMap = {};
    applications.forEach((app) => {
      if (app.parsedCV && app.parsedCV.skills) {
        app.parsedCV.skills.forEach((skill) => {
          skillMap[skill] = (skillMap[skill] || 0) + 1;
        });
      }
    });
    const topSkills = Object.entries(skillMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    res.json({
      totalJobs,
      totalApplications,
      totalCandidates: candidates,
      totalInterviews,
      acceptedRate,
      statusBreakdown: { pending, reviewed, interview, accepted, rejected },
      jobsByLocation: locationMap,
      topSkills,
    });
  } catch (error) {
    next(error);
  }
};

const getJobStats = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ jobId: job._id });
    const interviews = await Interview.find({ applicationId: { $in: applications.map((a) => a._id) } });

    const statusCounts = { pending: 0, reviewed: 0, interview: 0, accepted: 0, rejected: 0 };
    applications.forEach((a) => {
      if (statusCounts[a.status] !== undefined) statusCounts[a.status]++;
    });

    const skillMap = {};
    applications.forEach((app) => {
      if (app.parsedCV && app.parsedCV.skills) {
        app.parsedCV.skills.forEach((skill) => {
          skillMap[skill] = (skillMap[skill] || 0) + 1;
        });
      }
    });
    const topSkills = Object.entries(skillMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    res.json({
      job: { _id: job._id, title: job.title, status: job.status },
      totalApplications: applications.length,
      statusBreakdown: statusCounts,
      totalInterviews: interviews.length,
      topSkills,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getJobStats };
