const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// POST /api/enroll  { courseId }  (student)
exports.enroll = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (await Enrollment.findOne({ student: req.user._id, course: courseId })) {
      return res.status(409).json({ message: 'You are already enrolled in this course' });
    }
    const enrollment = await Enrollment.create({ student: req.user._id, course: courseId });
    res.status(201).json(await enrollment.populate('course'));
  } catch (err) {
    next(err);
  }
};

// GET /api/my-courses  (student)
exports.myCourses = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({ path: 'course', populate: { path: 'instructor', select: 'name' } })
      .sort('-createdAt');
    res.json(enrollments.filter((e) => e.course));
  } catch (err) {
    next(err);
  }
};

// PUT /api/enrollments/:id/progress  { lessonId } toggles a lesson complete, or { progress } sets directly
exports.updateProgress = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({ _id: req.params.id, student: req.user._id });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    const { lessonId, progress } = req.body;
    if (lessonId) {
      const course = await Course.findById(enrollment.course);
      if (!course.lessons.id(lessonId)) return res.status(404).json({ message: 'Lesson not found' });
      const i = enrollment.completedLessons.findIndex((l) => l.toString() === lessonId);
      if (i >= 0) enrollment.completedLessons.splice(i, 1);
      else enrollment.completedLessons.push(lessonId);
      enrollment.progress = course.lessons.length
        ? Math.round((enrollment.completedLessons.length / course.lessons.length) * 100)
        : 0;
    } else if (progress !== undefined) {
      const p = Number(progress);
      if (Number.isNaN(p) || p < 0 || p > 100) return res.status(400).json({ message: 'Progress must be between 0 and 100' });
      enrollment.progress = p;
    } else {
      return res.status(400).json({ message: 'Provide lessonId or progress' });
    }
    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    next(err);
  }
};
