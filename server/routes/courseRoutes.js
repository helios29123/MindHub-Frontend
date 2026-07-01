const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get categories with course counts
router.get('/categories', async (req, res) => {
  try {
    const courses = await prisma.course.groupBy({
      by: ['category'],
      where: {
        status: 'active'
      },
      _count: {
        category: true
      }
    });

    const categories = courses.map(c => ({
      name: c.category,
      count: c._count.category
    })).filter(c => c.count > 0);

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get featured courses
router.get('/featured', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: 'active',
        isFeatured: true
      },
      take: 8,
      include: {
        instructor: true
      }
    });
    res.json(courses.map(c => ({
      ...c,
      instructorName: c.instructor?.name || 'Giảng viên',
      instructorAvatar: c.instructor?.avatar || ''
    })));
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bestseller courses
router.get('/bestsellers', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: 'active',
        isBestseller: true
      },
      take: 8,
      include: {
        instructor: true
      }
    });
    res.json(courses.map(c => ({
      ...c,
      instructorName: c.instructor?.name || 'Giảng viên',
      instructorAvatar: c.instructor?.avatar || ''
    })));
  } catch (error) {
    console.error('Error fetching bestseller courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Q&A Routes
// Get questions for a course
router.get('/:id/questions', async (req, res) => {
  try {
    const { id } = req.params;
    const { isInternal } = req.query;

    const whereClause = { courseId: id };
    if (isInternal !== undefined) {
      whereClause.isInternal = isInternal === 'true';
    }

    const questions = await prisma.courseQuestion.findMany({
      where: whereClause,
      include: {
        author: {
          select: { name: true, avatar: true, role: true }
        },
        answers: {
          include: {
            author: {
              select: { name: true, avatar: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a question
router.post('/:id/questions', async (req, res) => {
  try {
    const { id } = req.params;
    const { authorId, content, isInternal, lessonId } = req.body;
    
    if (!authorId || !content) {
      return res.status(400).json({ error: 'authorId and content are required' });
    }

    // Basic check: if isInternal is true, user must be enrolled
    if (isInternal) {
      const enrollment = await prisma.enrollment.findFirst({
        where: { courseId: id, userId: authorId }
      });
      if (!enrollment) {
        return res.status(403).json({ error: 'Chỉ học viên đã đăng ký mới được hỏi trong quá trình học' });
      }
    }

    const question = await prisma.courseQuestion.create({
      data: {
        courseId: id,
        authorId,
        content,
        isInternal: !!isInternal,
        lessonId: lessonId || null,
        status: 'open'
      },
      include: {
        author: {
          select: { name: true, avatar: true, role: true }
        },
        answers: true
      }
    });
    res.status(201).json(question);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Answer a question
router.post('/:id/questions/:questionId/answers', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { authorId, content } = req.body;

    if (!authorId || !content) {
      return res.status(400).json({ error: 'authorId and content are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: authorId } });
    const isInstructor = user?.role === 'instructor';
    const isAdmin = user?.role === 'admin';

    const answer = await prisma.courseAnswer.create({
      data: {
        questionId,
        authorId,
        content,
        isInstructorAnswer: isInstructor,
        isAdminAnswer: isAdmin
      },
      include: {
        author: {
          select: { name: true, avatar: true, role: true }
        }
      }
    });

    // Update question status if instructor or admin answered
    if (isInstructor || isAdmin) {
      await prisma.courseQuestion.update({
        where: { id: questionId },
        data: { status: 'answered' }
      });
    }

    res.status(201).json(answer);
  } catch (error) {
    console.error('Error adding answer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
