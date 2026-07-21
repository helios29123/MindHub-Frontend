import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { QAFilterState } from './types';

interface QAFilterProps {
  filter: QAFilterState;
  setFilter: React.Dispatch<React.SetStateAction<QAFilterState>>;
}

export const QAFilter: React.FC<QAFilterProps> = ({ filter, setFilter }) => {
  const [localKeyword, setLocalKeyword] = useState(filter.keyword);
  const [localStatus, setLocalStatus] = useState(filter.status);
  const [localCourse, setLocalCourse] = useState(filter.course);
  const [localLesson, setLocalLesson] = useState(filter.lesson);

  const handleApplyFilter = () => {
    setFilter(prev => ({
      ...prev,
      keyword: localKeyword,
      status: localStatus,
      course: localCourse,
      lesson: localLesson
    }));
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-3xs border border-slate-100 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        {/* Khóa học */}
        <div className="space-y-1 text-left">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khóa học</label>
          <select
            className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white cursor-pointer"
            value={localCourse}
            onChange={(e) => setLocalCourse(e.target.value)}
          >
            <option value="all">Tất cả khóa học</option>
            <option value="course1">React.js Cơ bản</option>
            <option value="course2">Next.js Thực chiến</option>
          </select>
        </div>

        {/* Bài học */}
        <div className="space-y-1 text-left">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bài học</label>
          <select
            className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white cursor-pointer"
            value={localLesson}
            onChange={(e) => setLocalLesson(e.target.value)}
          >
            <option value="all">Tất cả bài học</option>
            <option value="lesson1">Bài 1: Giới thiệu</option>
            <option value="lesson2">Bài 2: Hooks</option>
            <option value="lesson12">Bài 12: React useEffect Hook</option>
            <option value="lesson8">Bài 8: State và Props trong React</option>
            <option value="lesson10">Bài 10: Conditional Rendering</option>
            <option value="lesson6">Bài 6: Event Handling</option>
            <option value="lesson9">Bài 9: Lists & Keys</option>
            <option value="lesson7">Bài 7: Forms trong React</option>
          </select>
        </div>

        {/* Trạng thái */}
        <div className="space-y-1 text-left">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</label>
          <select
            className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white cursor-pointer"
            value={localStatus}
            onChange={(e) => setLocalStatus(e.target.value as QAFilterState['status'])}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="unanswered">Chưa trả lời</option>
            <option value="answered">Đã trả lời</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>

        {/* Từ khóa */}
        <div className="space-y-1 text-left">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Từ khóa</label>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi, học viên..."
              className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal"
              value={localKeyword}
              onChange={(e) => setLocalKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyFilter();
              }}
            />
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          </div>
        </div>

        {/* Button áp dụng bộ lọc */}
        <div>
          <button
            onClick={handleApplyFilter}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-normal hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm h-9 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
};
