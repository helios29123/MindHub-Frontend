import React, { useState } from 'react';
import { 
  Bookmark, MoreVertical, Send, EyeOff, User, 
  Bold, Italic, Underline, Strikethrough, Code, Link as LinkIcon, 
  List, ListOrdered, AlignLeft, Smile, Image as ImageIcon, Table, Undo2, Redo2
} from 'lucide-react';
import { Question } from './types';

interface QADetailViewProps {
  question: Question | null;
  onReply: (replyText: string, isOfficial: boolean, notifyStudent: boolean) => void;
  onHide: () => void;
  onToggleBookmark: () => void;
}

export const QADetailView: React.FC<QADetailViewProps> = ({
  question,
  onReply,
  onHide,
  onToggleBookmark,
}) => {
  const [replyText, setReplyText] = useState('');
  const [isOfficial, setIsOfficial] = useState(true);
  const [notifyStudent, setNotifyStudent] = useState(true);
  const [validationError, setValidationError] = useState('');

  const [sortReplies, setSortReplies] = useState<'newest' | 'oldest'>('newest');

  if (!question) {
    return (
      <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 p-8 text-center flex flex-col items-center justify-center h-[750px]">
        <User className="w-16 h-16 text-slate-200 mb-4" />
        <h3 className="text-sm font-black text-slate-800">Không có câu hỏi nào được chọn</h3>
        <p className="text-xs text-slate-400 mt-1">Chọn một câu hỏi ở danh sách bên trái để xem chi tiết.</p>
      </div>
    );
  }

  const handleReplySubmit = () => {
    if (!replyText.trim()) {
      setValidationError('Vui lòng nhập câu trả lời trước khi gửi!');
      return;
    }
    setValidationError('');
    onReply(replyText, isOfficial, notifyStudent);
    setReplyText('');
  };

  const getBadgeStyle = (status: Question['status']) => {
    switch (status) {
      case 'unanswered':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'answered':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'hidden':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  const getBadgeLabel = (status: Question['status']) => {
    switch (status) {
      case 'unanswered':
        return 'Chưa trả lời';
      case 'answered':
        return 'Đã trả lời';
      case 'hidden':
        return 'Đã ẩn';
      default:
        return status;
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins > 0 ? diffMins : 1} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  // Sort replies based on selection
  const sortedReplies = [...(question.replies || [])].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortReplies === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 flex flex-col h-[750px] overflow-hidden">
      {/* Detail Header */}
      <div className="p-5 border-b border-slate-50 shrink-0 text-left bg-slate-50/20">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={question.student_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'} 
              alt={question.student_name}
              className="w-10 h-10 rounded-full border border-slate-100 object-cover"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-black text-slate-800">{question.student_name}</h3>
                <span className="text-[9px] text-slate-400 font-bold">•</span>
                <a href="#" className="text-xs font-bold text-brand-normal hover:underline">{question.lesson_name}</a>
                <span className="text-[9px] text-slate-400 font-bold">•</span>
                <span className="text-[10px] text-slate-400 font-bold">{formatTime(question.created_at)}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                Thiết bị: {question.device || 'Windows'} • Trình duyệt: {question.browser || 'Chrome 124.0.0.0'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getBadgeStyle(question.status)}`}>
              {getBadgeLabel(question.status)}
            </span>
            <button 
              onClick={onToggleBookmark}
              className={`p-1.5 rounded-lg border transition-colors ${
                question.is_bookmarked 
                  ? 'bg-amber-50 text-amber-500 border-amber-200' 
                  : 'bg-white text-slate-400 hover:text-slate-600 border-slate-200'
              }`}
              title="Đánh dấu câu hỏi"
            >
              <Bookmark className={`w-3.5 h-3.5 ${question.is_bookmarked ? 'fill-amber-500' : ''}`} />
            </button>
            <button className="p-1.5 bg-white text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Content (Scrollable Thread) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-left">
        {/* Original Question Content */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-800 leading-relaxed whitespace-pre-line">
            “{question.content}”
          </p>
        </div>

        {/* Responses Thread */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-wider">
              {question.replies?.length ?? question.reply_count} câu trả lời
            </h4>
            
            <select
              value={sortReplies}
              onChange={(e) => setSortReplies(e.target.value as 'newest' | 'oldest')}
              className="text-[11px] font-bold text-slate-500 bg-transparent outline-none cursor-pointer hover:text-brand-normal"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>

          <div className="space-y-4">
            {sortedReplies.map((reply) => {
              const isInstructor = reply.role === 'instructor';
              return (
                <div 
                  key={reply.id} 
                  className={`p-4 rounded-2xl border transition-all flex flex-col gap-2 ${
                    isInstructor 
                      ? 'bg-brand-light/5 border-brand-light/35 ml-6' 
                      : 'bg-white border-slate-100 mr-6 shadow-3xs'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img 
                        src={reply.user_avatar || (isInstructor 
                          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80' 
                          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'
                        )} 
                        alt={reply.user_name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-100"
                      />
                      <div>
                        <span className="text-xs font-black text-slate-800">
                          {reply.user_name}
                        </span>
                        {isInstructor && (
                          <span className="ml-1.5 px-1 py-0.2 bg-brand-normal text-white text-[8px] font-black rounded-md uppercase tracking-wider">
                            Giảng viên
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {formatTime(reply.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {reply.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reply Editor (Footer) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/30 shrink-0 text-left">
        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Trả lời học viên</h4>
        
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center gap-1 bg-white border border-slate-200 border-b-0 rounded-t-xl p-1.5">
          <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></button>
          <div className="w-[1px] h-4 bg-slate-250 mx-1" />
          <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Code"><Code className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Link"><LinkIcon className="w-3.5 h-3.5" /></button>
          <div className="w-[1px] h-4 bg-slate-250 mx-1" />
          <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Unordered List"><List className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Ordered List"><ListOrdered className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Align"><AlignLeft className="w-3.5 h-3.5" /></button>
          <div className="w-[1px] h-4 bg-slate-250 mx-1" />
          <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Emoji"><Smile className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Image"><ImageIcon className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Table"><Table className="w-3.5 h-3.5" /></button>
          <div className="w-[1px] h-4 bg-slate-250 mx-1" />
          <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Undo"><Undo2 className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Redo"><Redo2 className="w-3.5 h-3.5" /></button>
        </div>

        {/* Editor Textarea */}
        <textarea
          rows={3}
          placeholder="Nhập câu trả lời của bạn..."
          value={replyText}
          onChange={(e) => {
            setReplyText(e.target.value);
            if (e.target.value.trim()) setValidationError('');
          }}
          className={`w-full border p-3 text-xs outline-none focus:ring-1 focus:ring-brand-normal resize-none ${
            validationError ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'
          }`}
        />
        
        {validationError && (
          <p className="text-[10px] font-bold text-red-500 mt-1">{validationError}</p>
        )}

        {/* Checkboxes & Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
          <div className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={isOfficial} 
                onChange={(e) => setIsOfficial(e.target.checked)}
                className="w-3.5 h-3.5 accent-brand-normal rounded"
              />
              Đánh dấu là câu trả lời chính thức
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={notifyStudent} 
                onChange={(e) => setNotifyStudent(e.target.checked)}
                className="w-3.5 h-3.5 accent-brand-normal rounded"
              />
              Gửi thông báo cho học viên
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setReplyText('');
                setValidationError('');
              }}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={onHide}
              className="px-4 py-2 border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Ẩn câu hỏi
            </button>
            <button
              onClick={handleReplySubmit}
              className="px-4 py-2 bg-brand-normal hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Trả lời
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
