const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// GET /api/admin/analytics
exports.analytics = async (req, res, next) => {
  try {
    const [users, students, instructors, admins, courses, enrollments] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      User.countDocuments({ role: 'admin' }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
    ]);
    const popular = await Enrollment.aggregate([
      { $group: { _id: '$course', enrollments: { $sum: 1 } } },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $project: { _id: 0, title: '$course.title', enrollments: 1 } },
    ]);
    const byCategory = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ users, students, instructors, admins, courses, enrollments, popular, byCategory });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    res.json(await User.find().sort('-createdAt'));
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id  { role }
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'instructor', 'student'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'You cannot change your own role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { returnDocument: 'after', runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'You cannot delete your own account' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Enrollment.deleteMany({ student: user._id });
    const owned = await Course.find({ instructor: user._id }).select('_id');
    await Enrollment.deleteMany({ course: { $in: owned.map((c) => c._id) } });
    await Course.deleteMany({ instructor: user._id });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};
