const express = require('express');
const {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  revokeAllTokens,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.post('/verify-email', verifyEmail);
router.post('/resend-verify-email', resendVerifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Refresh & Logout - không cần protect vì dùng refreshToken
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/revoke-all-tokens', protect, revokeAllTokens);

module.exports = router;
