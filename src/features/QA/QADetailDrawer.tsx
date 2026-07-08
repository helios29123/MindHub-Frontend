import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Loader2 } from 'lucide-react';
import { Question, Reply } from './types';

interface QADetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
}

// Mock replies for demonstration
const mockReplies: Reply[] = [
  {
    id: '1',
    user_name: 'Giảng viên',
    role: 'instructor',
    content: 'Chào bạn, hook useState hoạt động bất đồng bộ nên bạn cần sử dụng callback trong setState để lấy giá trị mới nhất nhé.',
    created_at: '2026-07-08T10:05:00Z'
  }
];

export const QADetailDrawer: React.FC<QADetailDrawerProps> = ({ isOpen, onClose, question }) => {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);

  // Update replies when question changes
  React.useEffect(() => {
    if (question?.is_answered) {
      setReplies(mockReplies);
    } else {
      setReplies([]);
    }
  }, [question]);

  const handleSubmit = async () => {
    if (!replyText.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newReply: Reply = {
      id: Date.now().toString(),
      user_name: 'Giảng viên',
      role: 'instructor',
      content: replyText,
      created_at: new Date().toISOString()
    };
    
    setReplies([...replies, newReply]);
    setReplyText('');
    setIsSubmitting(false);
  };

  if (!isOpen || !question) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Chi tiết câu hỏi</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
            {/* Original Question */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{question.student_name}</h3>
                  <p className="text-xs text-slate-500">
                    {new Date(question.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 mb-3 border border-slate-100">
                <span className="font-medium text-slate-700">Khóa học:</span> {question.course_name} <br/>
                <span className="font-medium text-slate-700">Bài học:</span> {question.lesson_name}
              </div>
              <p className="text-slate-800 whitespace-pre-wrap">{question.content}</p>
            </div>

            {/* Replies List */}
            {replies.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider ml-1">
                  Phản hồi ({replies.length})
                </h4>
                {replies.map(reply => (
                  <div 
                    key={reply.id} 
                    className={`p-4 rounded-xl shadow-sm border ${
                      reply.role === 'instructor' 
                        ? 'bg-blue-50 border-blue-100 ml-6' 
                        : 'bg-white border-slate-100 mr-6'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-semibold text-sm ${reply.role === 'instructor' ? 'text-blue-700' : 'text-slate-800'}`}>
                        {reply.user_name}
                      </span>
                      {reply.role === 'instructor' && (
                        <span className="px-1.5 py-0.5 bg-blue-200 text-blue-800 text-[10px] font-bold rounded">
                          GIẢNG VIÊN
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">
                        {new Date(reply.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reply Form */}
          <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <textarea
              className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3 text-sm"
              rows={4}
              placeholder="Nhập câu trả lời của bạn..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !replyText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Gửi trả lời
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
