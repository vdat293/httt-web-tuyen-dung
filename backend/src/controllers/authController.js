const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTPCode = require('../models/OTPCode');
const { sendEmail, templates } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const register = async (req, res, next) => {
  try {
    const { email, password, role, name, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ email, password, role, name, phone });
    
    // Tạo OTP và gửi email
    const otp = generateOTP();
    await OTPCode.create({
      email,
      otp,
      type: 'verifyEmail',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 phút
    });
    if (req.io) req.io.to('admin_room').emit('new_otp');
    
    const template = templates.verifyEmail(user, otp);
    await sendEmail({ to: email, subject: template.subject, html: template.html });

    res.status(201).json({
      message: 'Đăng ký thành công. Vui lòng kiểm tra email (hoặc admin panel) để lấy mã OTP xác thực.',
      user: { email: user.email }
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTPCode.findOne({ email, otp, type: 'verifyEmail', isUsed: false });
    
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
    }
    
    otpRecord.isUsed = true;
    await otpRecord.save();
    
    const user = await User.findOne({ email });
    if(user) {
      user.emailVerified = true;
      await user.save();
    }
    
    res.json({ message: 'Xác thực email thành công. Bạn có thể đăng nhập ngay.' });
  } catch (error) {
    next(error);
  }
};

const resendVerifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ message: 'Email đã được xác thực.' });

    const otp = generateOTP();
    await OTPCode.create({
      email,
      otp,
      type: 'verifyEmail',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    if (req.io) req.io.to('admin_room').emit('new_otp');
    
    const template = templates.verifyEmail(user, otp);
    await sendEmail({ to: email, subject: template.subject, html: template.html });

    res.json({ message: 'Đã gửi lại mã OTP xác thực.' });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ admin.' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ 
        message: 'Email chưa được xác thực. Vui lòng xác thực email.',
        needsVerification: true,
        email: user.email
      });
    }

    const token = generateToken(user._id);

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        companyLogo: user.companyLogo,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống.' });
    }
    
    const otp = generateOTP();
    await OTPCode.create({
      email,
      otp,
      type: 'resetPassword',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    if (req.io) req.io.to('admin_room').emit('new_otp');
    
    const template = templates.resetPassword(user, otp);
    await sendEmail({ to: email, subject: template.subject, html: template.html });
    
    res.json({ message: 'Đã gửi mã OTP đặt lại mật khẩu.' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const otpRecord = await OTPCode.findOne({ email, otp, type: 'resetPassword', isUsed: false });
    
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.password = newPassword;
    await user.save();
    
    otpRecord.isUsed = true;
    await otpRecord.save();
    
    res.json({ message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.' });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe, verifyEmail, resendVerifyEmail, forgotPassword, resetPassword };
