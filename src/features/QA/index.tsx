import React, { useState } from 'react';
import { QAOverview } from './QAOverview';
import { QAFilter } from './QAFilter';
import { QAList } from './QAList';
import { QADetailView } from './QADetailView';
import { Question, QAFilterState, Reply } from './types';
import { HelpCircle, Sparkles } from 'lucide-react';

// Detailed Mock data representing the sample layout items
const initialQuestions: Question[] = [
  {
    id: '1',
    student_name: 'Trần Quốc Bảo',
    student_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    content: 'Thầy ơi, dependency array trong useEffect hoạt động như thế nào ạ?',
    course_name: 'React.js Cơ bản',
    lesson_name: 'Bài 12: React useEffect Hook',
    created_at: '2026-07-19T09:30:00Z', // 1 hour ago
    is_answered: false,
    reply_count: 2,
    status: 'unanswered',
    device: 'Windows',
    browser: 'Chrome 124.0.0.0',
    is_bookmarked: false,
    replies: [
      {
        id: 'r1_1',
        user_name: 'Trần Quốc Bảo',
        user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: 'student',
        content: 'Dạ em hiểu rồi ạ, cảm ơn thầy!',
        created_at: '2026-07-19T09:45:00Z'
      },
      {
        id: 'r1_2',
        user_name: 'Nguyễn Văn Minh (Bạn)',
        role: 'instructor',
        content: 'Dependency array là danh sách các giá trị mà useEffect sẽ theo dõi. Khi các giá trị trong array thay đổi, useEffect sẽ chạy lại.',
        created_at: '2026-07-19T10:00:00Z'
      }
    ]
  },
  {
    id: '2',
    student_name: 'Lê Hoàng Mai',
    student_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    content: 'Khi nào thì nên dùng useState và khi nào dùng useReducer ạ?',
    course_name: 'React.js Cơ bản',
    lesson_name: 'Bài 8: State và Props trong React',
    created_at: '2026-07-19T07:30:00Z', // 3 hours ago
    is_answered: true,
    reply_count: 1,
    status: 'answered',
    device: 'macOS',
    browser: 'Safari 17.2',
    is_bookmarked: false,
    replies: [
      {
        id: 'r2_1',
        user_name: 'Nguyễn Văn Minh (Bạn)',
        role: 'instructor',
        content: 'Chào Mai, useState thường dùng cho state đơn giản, còn useReducer tốt hơn khi state có cấu trúc phức tạp hoặc state tiếp theo phụ thuộc vào state trước đó.',
        created_at: '2026-07-19T08:30:00Z'
      }
    ]
  },
  {
    id: '3',
    student_name: 'Phạm Duy Anh',
    student_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    content: 'Nếu điều kiện render phức tạp thì có cách nào tối ưu hơn không ạ?',
    course_name: 'React.js Cơ bản',
    lesson_name: 'Bài 10: Conditional Rendering',
    created_at: '2026-07-19T05:30:00Z', // 5 hours ago
    is_answered: false,
    reply_count: 0,
    status: 'unanswered',
    device: 'Android',
    browser: 'Chrome Mobile 123.0',
    is_bookmarked: false,
    replies: []
  },
  {
    id: '4',
    student_name: 'Nguyễn Thảo Vy',
    student_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    content: 'Event trong React có khác gì so với DOM thường không ạ?',
    course_name: 'React.js Cơ bản',
    lesson_name: 'Bài 6: Event Handling',
    created_at: '2026-07-18T10:30:00Z', // 1 day ago
    is_answered: true,
    reply_count: 3,
    status: 'answered',
    device: 'iOS',
    browser: 'Safari Mobile 17.0',
    is_bookmarked: true,
    replies: [
      {
        id: 'r4_1',
        user_name: 'Nguyễn Văn Minh (Bạn)',
        role: 'instructor',
        content: 'Chào Vy, Event trong React (SyntheticEvent) là wrapper chuẩn hóa chạy cross-browser, và sử dụng camelCase thay vì lowercase.',
        created_at: '2026-07-18T16:30:00Z'
      }
    ]
  },
  {
    id: '5',
    student_name: 'Đỗ Minh Quân',
    student_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    content: 'Key có nhất thiết phải là id không ạ? Dùng index được không?',
    course_name: 'React.js Cơ bản',
    lesson_name: 'Bài 9: Lists & Keys',
    created_at: '2026-07-18T08:30:00Z', // 1 day ago
    is_answered: false,
    reply_count: 1,
    status: 'hidden',
    device: 'Windows',
    browser: 'Firefox 125.0',
    is_bookmarked: false,
    replies: [
      {
        id: 'r5_1',
        user_name: 'Nguyễn Văn Minh (Bạn)',
        role: 'instructor',
        content: 'Chào Quân, dùng index có thể gây lỗi hiệu năng hoặc sai lệch UI khi danh sách thay đổi thứ tự. Nên ưu tiên dùng ID duy nhất nhé.',
        created_at: '2026-07-18T10:30:00Z'
      }
    ]
  },
  {
    id: '6',
    student_name: 'Vũ Hoài Nam',
    student_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    content: 'Làm sao để handle validation cho form phức tạp trong React?',
    course_name: 'React.js Cơ bản',
    lesson_name: 'Bài 7: Forms trong React',
    created_at: '2026-07-17T10:30:00Z', // 2 days ago
    is_answered: true,
    reply_count: 0,
    status: 'answered',
    device: 'macOS',
    browser: 'Chrome 124.0.0.0',
    is_bookmarked: false,
    replies: []
  }
];

export const InstructorQAModule: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('1');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filter state
  const [filter, setFilter] = useState<QAFilterState>({
    keyword: '',
    status: 'all',
    course: 'all',
    lesson: 'all',
    sort: 'newest'
  });

  // Stat numbers matching the mockup exactly, but updating based on actions
  const [unansweredCount, setUnansweredCount] = useState(18);
  const [answeredCount, setAnsweredCount] = useState(156);
  const [todayCommentsCount, setTodayCommentsCount] = useState(32);
  const [bookmarkedCount, setBookmarkedCount] = useState(12);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter and sort questions state
  const filteredQuestions = questions.filter(q => {
    // Course filter
    if (filter.course !== 'all') {
      if (filter.course === 'course1' && q.course_name !== 'React.js Cơ bản') return false;
      if (filter.course === 'course2' && q.course_name !== 'Next.js Thực chiến') return false;
    }

    // Lesson filter
    if (filter.lesson !== 'all') {
      if (filter.lesson === 'lesson12' && !q.lesson_name.includes('Bài 12')) return false;
      if (filter.lesson === 'lesson8' && !q.lesson_name.includes('Bài 8')) return false;
      if (filter.lesson === 'lesson10' && !q.lesson_name.includes('Bài 10')) return false;
      if (filter.lesson === 'lesson6' && !q.lesson_name.includes('Bài 6')) return false;
      if (filter.lesson === 'lesson9' && !q.lesson_name.includes('Bài 9')) return false;
      if (filter.lesson === 'lesson7' && !q.lesson_name.includes('Bài 7')) return false;
    }

    // Status filter
    if (filter.status !== 'all') {
      if (filter.status === 'bookmarked') {
        if (!q.is_bookmarked) return false;
      } else if (q.status !== filter.status) {
        return false;
      }
    }

    // Keyword filter
    if (filter.keyword) {
      const lower = filter.keyword.toLowerCase();
      const matchContent = q.content.toLowerCase().includes(lower);
      const matchStudent = q.student_name.toLowerCase().includes(lower);
      const matchLesson = q.lesson_name.toLowerCase().includes(lower);
      if (!matchContent && !matchStudent && !matchLesson) return false;
    }

    return true;
  }).sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return filter.sort === 'newest' ? timeB - timeA : timeA - timeB;
  });

  const activeQuestion = questions.find(q => q.id === selectedQuestionId) || null;

  // Handle Q&A Actions
  const handleReply = (replyText: string, isOfficial: boolean, notifyStudent: boolean) => {
    if (!activeQuestion) return;

    const newReply: Reply = {
      id: 'r_new_' + Date.now(),
      user_name: 'Nguyễn Văn Minh (Bạn)',
      role: 'instructor',
      content: replyText,
      created_at: new Date().toISOString()
    };

    setQuestions(prev => prev.map(q => {
      if (q.id === activeQuestion.id) {
        const wasUnanswered = q.status === 'unanswered';
        
        // Update stats dynamically if transitioning from unanswered to answered
        if (wasUnanswered) {
          setUnansweredCount(c => Math.max(0, c - 1));
          setAnsweredCount(c => c + 1);
        }
        setTodayCommentsCount(c => c + 1);

        return {
          ...q,
          is_answered: true,
          status: 'answered' as const,
          reply_count: (q.replies?.length ?? 0) + 1,
          replies: [...(q.replies || []), newReply]
        };
      }
      return q;
    }));

    showToast('Trả lời học viên thành công!');
  };

  const handleHide = () => {
    if (!activeQuestion) return;

    setQuestions(prev => prev.map(q => {
      if (q.id === activeQuestion.id) {
        const wasUnanswered = q.status === 'unanswered';
        const wasAnswered = q.status === 'answered';

        if (wasUnanswered) {
          setUnansweredCount(c => Math.max(0, c - 1));
        } else if (wasAnswered) {
          setAnsweredCount(c => Math.max(0, c - 1));
        }

        return {
          ...q,
          status: 'hidden' as const
        };
      }
      return q;
    }));

    showToast('Đã ẩn câu hỏi thành công.');
  };

  const handleToggleBookmark = () => {
    if (!activeQuestion) return;

    setQuestions(prev => prev.map(q => {
      if (q.id === activeQuestion.id) {
        const nextBookmarked = !q.is_bookmarked;
        if (nextBookmarked) {
          setBookmarkedCount(c => c + 1);
        } else {
          setBookmarkedCount(c => Math.max(0, c - 1));
        }

        showToast(nextBookmarked ? 'Đã đánh dấu câu hỏi.' : 'Đã bỏ đánh dấu câu hỏi.');
        return {
          ...q,
          is_bookmarked: nextBookmarked
        };
      }
      return q;
    }));
  };

  const handleFilterChange = (status: 'all' | 'unanswered' | 'answered' | 'hidden' | 'bookmarked') => {
    setFilter(prev => ({ ...prev, status }));
  };

  return (
    <div className="w-full text-left relative">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#111a4a] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border border-brand-light/20">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Hỏi đáp & Bình luận</h1>
            <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-650 cursor-pointer" />
          </div>
          <p className="text-slate-400 text-xs font-bold mt-1">Quản lý câu hỏi và bình luận của học viên trong các bài học</p>
        </div>
      </div>

      {/* Stat Cards */}
      <QAOverview
        unansweredCount={unansweredCount}
        answeredCount={answeredCount}
        todayCommentsCount={todayCommentsCount}
        bookmarkedCount={bookmarkedCount}
        activeFilterStatus={filter.status}
        onFilterChange={handleFilterChange}
      />

      {/* Filter Card */}
      <QAFilter filter={filter} setFilter={setFilter} />

      {/* Split Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Left column: List of Questions */}
        <div className="w-full lg:w-[48%] shrink-0">
          <QAList 
            questions={filteredQuestions} 
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={setSelectedQuestionId}
            sort={filter.sort}
            onSortChange={(sort) => setFilter(prev => ({ ...prev, sort }))}
          />
        </div>

        {/* Right column: Conversation detail & reply form */}
        <div className="w-full lg:w-[52%] shrink-0">
          <QADetailView 
            question={activeQuestion}
            onReply={handleReply}
            onHide={handleHide}
            onToggleBookmark={handleToggleBookmark}
          />
        </div>
      </div>
    </div>
  );
};
