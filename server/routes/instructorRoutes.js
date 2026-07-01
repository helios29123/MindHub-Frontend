const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get public instructor profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await prisma.user.findUnique({
      where: { id, role: 'instructor' },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        expertise: true,
        experienceYears: true,
        portfolioUrl: true,
        interestedTopics: true,
        createdAt: true,
      }
    });

    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    res.json(instructor);
  } catch (error) {
    console.error('Error fetching instructor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get courses by instructor (with filters)
router.get('/:id/courses', async (req, res) => {
  try {
    const { id } = req.params;
    const { search, category, subcategory, sort } = req.query;

    let whereClause = {
      instructorId: id,
      status: 'active'
    };

    if (search) {
      whereClause.title = {
        contains: search
      }; // sqlite doesn't support mode: 'insensitive' generally without extension, so we just use contains
    }
    if (category && category !== 'All') {
      whereClause.category = category;
    }
    if (subcategory && subcategory !== 'All') {
      whereClause.subcategory = subcategory;
    }

    let orderByClause = { createdAt: 'desc' }; // default: newest
    if (sort === 'popular') {
      orderByClause = { rating: 'desc' }; // approximation of popular
    } else if (sort === 'highest-rated') {
      orderByClause = { rating: 'desc' };
    } else if (sort === 'best-selling') {
      orderByClause = { isBestseller: 'desc' }; // or enrolledCount
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        instructor: { select: { name: true, avatar: true } }
      }
    });

    res.json(courses.map(c => ({
      ...c,
      instructorName: c.instructor?.name || 'Giảng viên',
      instructorAvatar: c.instructor?.avatar || ''
    })));
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
