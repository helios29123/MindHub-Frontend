const express = require('express');
const router = express.Router();

// Mock data structures (since real DB is not fully implemented here)
let users = [];
let courses = [];

// @route   GET /api/admin/users/:userId/courses
// @desc    Get all courses by a specific instructor
router.get('/users/:userId/courses', (req, res) => {
  try {
    const { userId } = req.params;
    // For mock backend, we just return empty array
    // The real implementation would query the database
    res.json({
      success: true,
      courses: courses.filter(c => c.instructorId === userId)
    });
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/admin/users/:userId/lock
// @desc    Lock or unlock a user account
router.post('/users/:userId/lock', (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'lock' or 'unlock'
    
    // In a real app, update user status in DB
    const newStatus = action === 'lock' ? 'locked' : 'active';
    
    res.json({
      success: true,
      message: action === 'lock' ? 'Tài khoản đã bị khóa.' : 'Tài khoản đã được mở khóa.',
      status: newStatus
    });
  } catch (error) {
    console.error('Error locking/unlocking user:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   PATCH /api/admin/courses/:courseId/status
// @desc    Update course status (hidden, archived, suspended, active)
router.patch('/courses/:courseId/status', (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.body; // 'hidden', 'archived', 'suspended', 'active'
    
    res.json({
      success: true,
      message: 'Đã cập nhật trạng thái khóa học.',
      courseId,
      status
    });
  } catch (error) {
    console.error('Error updating course status:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
