const { validationResult } = require('express-validator');
const User = require('../models/User');

// Helper: send a consistent token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateAuthToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

/**
 * @route   POST /auth/register
 * @access  Public
 */
const register = async (req, res) => {
  // 1. Validate incoming body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    // 2. Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // 3. Create user (password hashed by pre-save hook)
    const user = await User.create({ name, email, password, role });

    // 4. Return token
    sendTokenResponse(user, 201, res);
  } catch (err) {
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

/**
 * @route   POST /auth/login
 * @access  Public
 */
const login = async (req, res) => {
  // 1. Validate incoming body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // 2. Find user and explicitly select the password field (it's hidden by default)
    const user = await User.findOne({ email }).select('+password');

    // 3. Generic error - do NOT reveal whether email or password is wrong
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 4. Return token
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

/**
 * @route   GET /auth/me
 * @access  Private (requires protect middleware)
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = { register, login, getMe };
