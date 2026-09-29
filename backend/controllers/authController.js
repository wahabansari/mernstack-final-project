const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const respond = (res, status, user) =>
  res.status(status).json({
    token: signToken(user._id),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });

// POST /api/register  -- public signup can only create student or instructor accounts
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (role && !['student', 'instructor'].includes(role)) {
      return res.status(400).json({ message: "Role must be 'student' or 'instructor'" });
    }
    const user = await User.create({ name, email, password, role: role || 'student' });
    respond(res, 201, user);
  } catch (err) {
    next(err);
  }
};

// POST /api/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    respond(res, 200, user);
  } catch (err) {
    next(err);
  }
};

// GET /api/me
exports.me = (req, res) => res.json(req.user);
