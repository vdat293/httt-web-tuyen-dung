const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getProfile, updateProfile, uploadAvatar, updatePassword } = require('../controllers/profileController');

router.use(protect);

// GET /api/profile
router.get('/', getProfile);

// PUT /api/profile
router.put('/', updateProfile);

// POST /api/profile/avatar — Multer handles multipart
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// PUT /api/profile/password
router.put('/password', updatePassword);

module.exports = router;
