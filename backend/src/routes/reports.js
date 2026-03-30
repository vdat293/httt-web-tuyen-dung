const express = require('express');
const { getStats, getJobStats } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, authorize('employer'), getStats);
router.get('/jobs/:id', protect, authorize('employer'), getJobStats);

module.exports = router;
