const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const {
  getDashboard,
  getUsers,
  updateUser,
  deleteUser,
  getAllJobs,
  approveJob,
  rejectJob,
  lockJob,
  deleteJob,
  getReports,
  getAllOTPs,
} = require('../controllers/adminController');

router.use(protect);
router.use(adminOnly);

// Dashboard
router.get('/dashboard', getDashboard);

// Users
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Jobs
router.get('/jobs', getAllJobs);
router.put('/jobs/:id/approve', approveJob);
router.put('/jobs/:id/reject', rejectJob);
router.put('/jobs/:id/lock', lockJob);
router.delete('/jobs/:id', deleteJob);

// Reports
router.get('/reports', getReports);

// OTPs
router.get('/otps', getAllOTPs);

module.exports = router;
