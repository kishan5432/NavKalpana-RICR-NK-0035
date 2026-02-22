const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { setOTP, verifyOTP: verifyOTPUtil, deleteOTP } = require('../utils/otpStore');
const sendEmail = require('../utils/sendEmail');

const register = async (req, res, next) => {
  try {
    console.log('Register request body:', req.body);
    console.log('Register request headers:', req.headers);
    
    const { name, fullName, email, phone, password, role } = req.body;
    const userName = name || fullName;

    if (!userName || !email || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone must be 10 digits' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or phone already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({ name: userName, email, phone, passwordHash, role });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      }
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Get password hash separately for comparison
    const userWithPassword = await User.findById(user._id).select('+passwordHash');
    const isMatch = await bcrypt.compare(password, userWithPassword.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        rating: user.rating,
        profilePhoto: user.profilePhoto,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      }
    });
  } catch (err) {
    next(err);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or phone is required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const identifier = email || phone;

    setOTP(identifier, otp);

    if (email) {
      await sendEmail({
        to: email,
        subject: 'Your RideShareX verification code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">RideShareX Verification</h2>
            <p style="font-size: 16px; color: #555;">Your verification code is:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
              ${otp}
            </div>
            <p style="font-size: 14px; color: #777;">This code is valid for 10 minutes.</p>
          </div>
        `
      });
    }

    const response = { success: true, message: 'OTP sent successfully' };
    if (process.env.NODE_ENV === 'development') {
      response.otp = otp;
    }

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { otp, type, email } = req.body;

    // Use email from request body if not authenticated
    const identifier = req.user ? (type === 'email' ? req.user.email : req.user.phone) : email;
    
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const isValid = verifyOTPUtil(identifier, otp);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    deleteOTP(identifier);

    // Update user verification status
    const updateField = type === 'email' ? { isEmailVerified: true } : { isPhoneVerified: true };
    const user = await User.findOne({ email: identifier });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndUpdate(user._id, updateField);

    res.status(200).json({ success: true, message: 'Verified successfully' });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, sendOtp, verifyOtp, logout };
