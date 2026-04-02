const cron = require('node-cron');
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const { sendEmail, templates } = require('../services/emailService');
const Job = require('../models/Job');
const User = require('../models/User');

const startCronJobs = () => {
  // Chạy mỗi giờ lúc phút số 0
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Checking for upcoming interviews within 24h...');
    try {
      const now = new Date();
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const interviews = await Interview.find({
        status: 'scheduled',
        reminderSent: false,
        scheduledAt: { $gte: now, $lte: next24Hours }
      }).populate('applicationId');

      for (const interview of interviews) {
        if (!interview.applicationId) continue;
        
        const application = await Application.findById(interview.applicationId._id);
        if (!application) continue;

        const job = await Job.findById(application.jobId);
        const candidate = await User.findById(application.candidateId);
        
        if (!candidate || !job) continue;

        const template = templates.interviewReminder(interview, candidate, job);
        await sendEmail({
          to: candidate.email,
          subject: template.subject,
          html: template.html
        });

        // Mark as sent
        interview.reminderSent = true;
        await interview.save();
        console.log(`[CRON] Sent reminder to ${candidate.email} for interview at ${interview.scheduledAt}`);
      }
    } catch (error) {
      console.error('[CRON] Error:', error);
    }
  });
};

module.exports = startCronJobs;
