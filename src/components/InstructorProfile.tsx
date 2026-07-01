import React, { useState, useEffect } from 'react';
import { User, Course } from '../types';
import { ApiService } from '../services/api';
import { Search, MapPin, Briefcase, Mail, BookOpen, Star, Users, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface InstructorProfileProps {
  instructorId: string | null;
  onBack: () => void;
  onViewCourse: (course: Course) => void;
  renderCourseCard: (course: Course) => React.ReactNode;
}

export const InstructorProfile: React.FC<InstructorProfileProps> = ({ instructorId, onBack, onViewCourse, renderCourseCard }) => {
  const [instructor, setInstructor] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 8;
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  const [availableCategories, setAvailableCategories] = useState<string[]>(['All']);

  useEffect(() => {
    if (!instructorId) return;

    setLoading(true);
    // Fetch profile
    ApiService.getInstructorProfile(instructorId)
      .then(res => setInstructor(res))
      .catch(e => console.error(e));

  }, [instructorId]);

  useEffect(() => {
    if (!instructorId) return;

    setLoading(true);
    // Fetch courses with filters
    ApiService.getInstructorCourses(instructorId, {
      search: searchQuery,
      category: category !== 'All' ? category : undefined,
      page,
      limit
    }).then(res => {
      setCourses(res.courses);
      setTotalPages(res.totalPages);
      setTotalCourses(res.total);
      
      // Auto-extract categories from courses if we don't have them
      // Alternatively we can use a dedicated API
      if (res.courses.length > 0 && availableCategories.length === 1 && category === 'All' && !searchQuery) {
        const cats = Array.from(new Set(res.courses.map(c => c.category))).filter(Boolean);
        setAvailableCategories(['All', ...cats]);
      }
    }).catch(e => console.error(e))
      .finally(() => setLoading(false));

  }, [instructorId, searchQuery, category, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, category]);

  if (!instructorId) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 mt-6 max-w-4xl mx-auto">
        <p className="text-stone-500">Không tìm thấy thông tin giảng viên.</p>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-stone-100 rounded-xl hover:bg-stone-200 font-bold">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-8">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-stone-500 hover:text-brand-normal font-bold text-sm bg-white border border-stone-200 px-4 py-2 rounded-xl shadow-xs transition-all w-fit"
      >
        <ChevronLeft className="w-4 h-4" /> Quay lại
      </button>

      {/* Instructor Header */}
      {instructor ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm">
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <img 
              src={instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}&background=random`} 
              alt={instructor.name} 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-stone-50 shadow-md"
            />
            <div className="flex gap-4">
              <div className="flex flex-col items-center bg-stone-50 p-2.5 rounded-xl border border-stone-150 min-w-[80px]">
                <span className="text-xl font-black text-brand-dark">{totalCourses}</span>
                <span className="text-[10px] text-stone-500 font-bold uppercase">Khóa học</span>
              </div>
              <div className="flex flex-col items-center bg-stone-50 p-2.5 rounded-xl border border-stone-150 min-w-[80px]">
                <span className="text-xl font-black text-brand-dark">4.8+</span>
                <span className="text-[10px] text-stone-500 font-bold uppercase">Đánh giá</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-black text-deep-ink">{instructor.name}</h1>
              <p className="text-brand-normal font-bold mt-1 text-sm md:text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> {instructor.title || 'Giảng viên MindHub'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-xs font-medium text-stone-500 border-b border-stone-100 pb-4">
              {instructor.email && (
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {instructor.email}</span>
              )}
            </div>

            <div className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
              {instructor.bio || 'Chưa có thông tin giới thiệu cho giảng viên này.'}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-3xl p-8 flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-brand-normal/30 border-t-brand-normal rounded-full animate-spin"></div>
        </div>
      )}

      {/* Instructor Courses Section */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-2xl font-extrabold text-deep-ink flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-brand-normal" /> Các Khóa Học Giảng Dạy
            </h2>
            <p className="text-stone-500 text-xs mt-1">Được thiết kế và trực tiếp giảng dạy bởi {instructor?.name || 'giảng viên'}.</p>
          </div>
          
          <div className="bg-pale-cyan text-forest-teal font-bold px-3 py-1.5 rounded-lg text-xs uppercase shadow-xs">
            {totalCourses} Khóa học
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-center bg-stone-50 p-3 rounded-2xl border border-stone-200/60">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm khóa học của giảng viên này..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-250 rounded-xl text-sm focus:ring-2 focus:ring-brand-normal focus:border-brand-normal transition-all"
            />
          </div>

          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
                  category === cat 
                    ? 'bg-brand-normal text-white border-brand-normal shadow-sm' 
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat === 'All' ? 'Tất cả danh mục' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-normal/30 border-t-brand-normal rounded-full animate-spin"></div>
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(c => renderCourseCard(c))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6 pb-2">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8.5 h-8.5 text-xs font-bold rounded-xl transition-all border ${
                          pageNum === page
                            ? 'bg-deep-indigo text-white border-deep-indigo shadow-xs scale-105'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-400 bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-6">
            <Filter className="w-12 h-12 mx-auto text-stone-300 mb-3" />
            <p className="font-semibold text-stone-600">Không tìm thấy khóa học nào phù hợp.</p>
            <p className="text-xs text-stone-500 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
          </div>
        )}
      </div>
    </div>
  );
};
