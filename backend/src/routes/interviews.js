const express = require('express');
const {
  getInterviews,
  createInterview,
  updateInterview,
  getInterview,
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getInterviews);
router.get('/:id', protect, getInterview);
router.post('/', protect, authorize('employer'), createInterview);
router.put('/:id', protect, authorize('employer'), updateInterview);

module.exports = router;
