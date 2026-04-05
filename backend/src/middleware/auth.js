const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, no token',
        code: 'NO_TOKEN',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
      }

      // Cập nhật lastActiveAt
      req.user.lastActiveAt = new Date();
      await req.user.save();

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Access token expired',
          code: 'TOKEN_EXPIRED',
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
        });
      }
      return res.status(401).json({
        message: 'Not authorized, token failed',
        code: 'TOKEN_FAILED',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error in auth middleware' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };