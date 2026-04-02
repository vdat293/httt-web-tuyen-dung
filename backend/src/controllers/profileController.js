const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /api/profile — get current user's profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile — update profile info
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'phone', 'avatar',
      // candidate
      'skills', 'experience', 'education', 'bio', 'resumeUrl',
      // employer
      'companyName', 'companySize', 'industry', 'website', 'description', 'companyLogo',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// POST /api/profile/avatar — upload avatar
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile/password — change password
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar, updatePassword };
