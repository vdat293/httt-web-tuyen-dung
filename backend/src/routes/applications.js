const express = require('express');
const {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', protect, getApplications);
router.get('/:id', protect, getApplication);
router.post('/', protect, authorize('candidate'), upload.single('cv'), createApplication);
router.put('/:id/status', protect, authorize('employer'), updateApplicationStatus);

module.exports = router;
