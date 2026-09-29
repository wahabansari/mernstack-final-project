const router = require('express').Router();
const c = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', c.getCourses);
router.get('/mine', protect, authorize('instructor', 'admin'), c.myCreatedCourses);
router.get('/:id', c.getCourse);
router.post('/', protect, authorize('instructor', 'admin'), c.createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), c.updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), c.deleteCourse);
router.post('/:id/lessons', protect, authorize('instructor', 'admin'), c.addLesson);
router.delete('/:id/lessons/:lessonId', protect, authorize('instructor', 'admin'), c.deleteLesson);

module.exports = router;
