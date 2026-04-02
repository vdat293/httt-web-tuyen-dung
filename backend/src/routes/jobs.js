const express = require('express');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  incrementViews,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getJobs);
router.get('/my-jobs', protect, authorize('employer'), getMyJobs);
router.get('/:id', getJob);
router.get('/:id/view', incrementViews);
router.post('/', protect, authorize('employer'), createJob);
router.put('/:id', protect, authorize('employer'), updateJob);
router.delete('/:id', protect, authorize('employer'), deleteJob);

module.exports = router;
