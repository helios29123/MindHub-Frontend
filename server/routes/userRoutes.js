const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user enrollments (Completed and In-Progress courses)
router.get('/:id/enrollments', async (req, res) => {
  try {
    const { id } = req.params;
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: id },
      include: {
        course: {
          include: {
            instructor: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user learning activities (History)
router.get('/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    const activities = await prisma.learningActivity.findMany({
      where: { userId: id },
      include: {
        course: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
