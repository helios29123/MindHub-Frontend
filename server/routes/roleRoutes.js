const express = require('express');
const router = express.Router();

// Mock database for role requests
// In a real app, this would be in a database (e.g., MongoDB, PostgreSQL)
let roleRequests = [];

// @route   POST /api/roles/request-instructor
// @desc    Submit an application to become an instructor
router.post('/request-instructor', (req, res) => {
  try {
    const { userId, fullName, email, phone, bio, expertise, experienceYears, portfolioUrl } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' });
    }

    const newRequest = {
      id: 'req-' + Date.now(),
      userId,
      fullName,
      email,
      phone,
      bio,
      expertise,
      experienceYears,
      portfolioUrl,
      status: 'pending',
      requestType: 'become_instructor',
      createdAt: new Date().toISOString()
    };

    roleRequests.push(newRequest);

    res.json({
      success: true,
      message: 'Yêu cầu trở thành giảng viên đã được gửi đi.',
      request: newRequest
    });
  } catch (error) {
    console.error('Error submitting instructor request:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/roles/request-leave-instructor
// @desc    Submit an application to leave the instructor role
router.post('/request-leave-instructor', (req, res) => {
  try {
    const { userId, fullName, email, reason } = req.body;

    if (!userId || !email || !reason) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' });
    }

    const newRequest = {
      id: 'req-leave-' + Date.now(),
      userId,
      fullName,
      email,
      reason,
      status: 'pending',
      requestType: 'leave_instructor',
      createdAt: new Date().toISOString()
    };

    roleRequests.push(newRequest);

    res.json({
      success: true,
      message: 'Yêu cầu rời vai trò giảng viên đã được gửi đi.',
      request: newRequest
    });
  } catch (error) {
    console.error('Error submitting leave instructor request:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/roles/requests
// @desc    Get all instructor requests (Admin only)
router.get('/requests', (req, res) => {
  try {
    res.json({
      success: true,
      requests: roleRequests
    });
  } catch (error) {
    console.error('Error fetching role requests:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/roles/resolve
// @desc    Approve or reject an instructor request (Admin only)
router.post('/resolve', (req, res) => {
  try {
    const { requestId, action, rejectionReason } = req.body;

    if (!requestId || !action) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' });
    }

    const requestIndex = roleRequests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu.' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    roleRequests[requestIndex] = {
      ...roleRequests[requestIndex],
      status: newStatus,
      rejectionReason: newStatus === 'rejected' ? rejectionReason : null,
      reviewedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: action === 'approve' ? 'Đã phê duyệt yêu cầu.' : 'Đã từ chối yêu cầu.',
      request: roleRequests[requestIndex]
    });
  } catch (error) {
    console.error('Error resolving role request:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
