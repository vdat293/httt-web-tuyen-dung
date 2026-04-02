const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSavedJobs, saveJob, unsaveJob, isJobSaved } = require('../controllers/savedJobController');

router.use(protect);

// GET /api/saved-jobs
router.get('/', getSavedJobs);

// GET /api/saved-jobs/:jobId/is-saved
router.get('/:jobId/is-saved', isJobSaved);

// POST /api/saved-jobs/:jobId
router.post('/:jobId', saveJob);

// DELETE /api/saved-jobs/:jobId
router.delete('/:jobId', unsaveJob);

module.exports = router;
