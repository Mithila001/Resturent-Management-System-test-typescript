const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, getUsers, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
// User Management Routes
router.get('/users', protect, authorize('admin', 'owner', 'manager'), getUsers);
router.delete('/users/:id', protect, authorize('admin', 'owner'), deleteUser);

module.exports = router;
