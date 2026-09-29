const router = require('express').Router();
const a = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/analytics', a.analytics);
router.get('/users', a.getUsers);
router.put('/users/:id', a.updateUserRole);
router.delete('/users/:id', a.deleteUser);

module.exports = router;
