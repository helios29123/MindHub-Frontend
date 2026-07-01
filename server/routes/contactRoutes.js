const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
    }

    const newContact = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        status: 'pending'
      }
    });

    res.status(201).json({ success: true, data: newContact, message: 'Gửi liên hệ thành công.' });
  } catch (error) {
    console.error('Lỗi khi gửi liên hệ:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// GET /api/contact (Admin only)
router.get('/', async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách liên hệ:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
