const router = require('express').Router();
const e = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/enroll', protect, authorize('student'), e.enroll);
router.get('/my-courses', protect, authorize('student'), e.myCourses);
router.put('/enrollments/:id/progress', protect, authorize('student'), e.updateProgress);

module.exports = router;
