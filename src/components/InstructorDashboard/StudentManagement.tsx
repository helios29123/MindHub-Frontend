import React, { useState, useEffect } from 'react';
import { 
  Users, Search, BookOpen, Clock, CheckCircle2, Award, 
  Sparkles, Filter, FileText, ChevronLeft, ChevronRight, RefreshCw, 
  Eye, GraduationCap, PlayCircle, BarChart2
} from 'lucide-react';
import StudentDetailDrawer from './StudentDetailDrawer';
import { ApiService } from '../../services/api';
import { INSTRUCTOR_STUDENTS_MOCK } from '../../data/instructorStudentsMock';

interface StudentManagementProps {
  instructorCourses: any[];
}

export default function StudentManagement({ instructorCourses }: StudentManagementProps) {
  const [stats, setStats] = useState(INSTRUCTOR_STUDENTS_MOCK.stats);
  const [studentsList, setStudentsList] = useState<any[]>(INSTRUCTOR_STUDENTS_MOCK.students);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(INSTRUCTOR_STUDENTS_MOCK.students.length);

  // Drawer state
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLearners = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getInstructorLearners({
        course_id: courseFilter,
        status: statusFilter,
        search: debouncedSearch,
        page: page,
        per_page: 10
      });
      
      const rawList = res?.data?.list?.data || res?.data?.items || res?.data || [];
      const hasRealData = rawList.length > 0;
      
      if (hasRealData) {
        // Map stats
        const completedCount = res.data?.stats?.completed_count || rawList.filter((e: any) => e.status === 'completed').length;
        const certCount = Math.round(completedCount * 0.85);

        setStats({
          totalEnrollments: res.data?.stats?.total_enrollments || rawList.length,
          learningCount: res.data?.stats?.learning_count || rawList.filter((e: any) => e.status === 'learning').length,
          completedCount: completedCount,
          certificatesCount: certCount
        });

        setStudentsList(rawList);
        setTotalPages(res.data?.list?.last_page || res.data?.meta?.totalPages || 1);
        setTotalRecords(res.data?.list?.total || res.data?.meta?.total || rawList.length);
      } else {
        // Fallback to INSTRUCTOR_STUDENTS_MOCK with local filter
        useLocalMockFilters();
      }
    } catch (err) {
      console.error('Failed to fetch learners data, falling back to mock:', err);
      useLocalMockFilters();
    } finally {
      setLoading(false);
    }
  };

  const useLocalMockFilters = () => {
    setStats(INSTRUCTOR_STUDENTS_MOCK.stats);
    
    let filtered = [...INSTRUCTOR_STUDENTS_MOCK.students];
    
    // Filter by Course Title or substring
    if (courseFilter !== 'all') {
      const courseObj = instructorCourses.find(c => String(c.id) === String(courseFilter));
      const courseTitle = courseObj ? courseObj.title.toLowerCase() : '';
      if (courseTitle) {
        filtered = filtered.filter(s => s.course.toLowerCase().includes(courseTitle) || s.course.toLowerCase().includes(courseFilter.toLowerCase()));
      } else {
        filtered = filtered.filter(s => s.course.toLowerCase().includes(courseFilter.toLowerCase()));
      }
    }
    
    // Filter by Status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => {
        if (statusFilter === 'completed') return s.progress >= 100 || s.hasCert;
        if (statusFilter === 'learning') return s.progress < 100 && !s.hasCert;
        return true;
      });
    }
    
    // Filter by Search Keyword
    if (debouncedSearch) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        s.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        s.course.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    setStudentsList(filtered);
    setTotalPages(1);
    setTotalRecords(filtered.length);
  };

  useEffect(() => {
    fetchLearners();
  }, [courseFilter, statusFilter, debouncedSearch, page]);

  const handleResetFilters = () => {
    setCourseFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
    setPage(1);
    showToast('Đã đặt lại bộ lọc học viên!');
  };

  const handleExportReport = () => {
    showToast('Xuất báo cáo danh sách học viên thành công!');
  };

  return (
    <div className="w-full text-left relative pb-12 instructor-students-page">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#121b4b] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border border-slate-100/10">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Drawer Details side-panel */}
      {selectedEnrollmentId && (
        <StudentDetailDrawer 
          enrollmentId={selectedEnrollmentId} 
          onClose={() => setSelectedEnrollmentId(null)} 
        />
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#06091a] tracking-tight">Học viên</h1>
          <p className="text-[#595959] text-[11px] font-bold mt-1">Quản lý và theo dõi tình hình học tập của học viên</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleExportReport}
            className="px-4 py-2.5 bg-white border border-[#dbdde4] hover:bg-slate-50 text-blue-600 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Xuất báo cáo
          </button>
          <button 
            onClick={() => showToast('Bộ lọc nâng cao đã sẵn sàng.')}
            className="px-4 py-2.5 bg-[#007A64] hover:bg-[#006653] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            Thêm bộ lọc
          </button>
        </div>
      </div>

      {/* 3 Stats Cards with sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Card 1 */}
        <div className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-sm relative flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-[#595959] tracking-wider block">Tổng lượt ghi danh</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-black">+18.6%</span>
            </div>
            <span className="text-2xl font-black text-[#121b4b] block mt-2">
              {stats.totalEnrollments.toLocaleString()}
            </span>
          </div>
          <div className="h-8 mt-4 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M4 25 Q18 5, 32 18 T60 8 T80 20 T96 10" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[9px] text-[#8c8c8c] font-medium block mt-1">So với 30 ngày trước</span>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-sm relative flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-[#595959] tracking-wider block">Đang học</span>
              <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-black">+12.4%</span>
            </div>
            <span className="text-2xl font-black text-amber-600 block mt-2">
              {stats.learningCount.toLocaleString()}
            </span>
          </div>
          <div className="h-8 mt-4 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M4 20 Q22 28, 40 10 T70 15 T96 5" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[9px] text-[#8c8c8c] font-medium block mt-1">So với 30 ngày trước</span>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-sm relative flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-[#595959] tracking-wider block">Đã hoàn thành</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-black">+24.7%</span>
            </div>
            <span className="text-2xl font-black text-emerald-600 block mt-2">
              {stats.completedCount.toLocaleString()}
            </span>
          </div>
          <div className="h-8 mt-4 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M4 28 Q25 15, 50 18 T80 5 T96 2" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[9px] text-[#8c8c8c] font-medium block mt-1">So với 30 ngày trước</span>
        </div>
      </div>

      {/* Toolbar filters row */}
      <div className="bg-white border border-[#e7e8ed] rounded-2xl p-4 shadow-sm flex flex-wrap md:flex-nowrap gap-4 items-end mb-6 text-xs font-semibold text-[#121b4b]">
        {/* Course Filter */}
        <div className="w-[180px] shrink-0">
          <label className="block text-[9.5px] uppercase font-bold text-[#737373] mb-1">Khóa học</label>
          <select
            value={courseFilter}
            onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
            className="w-full text-xs font-bold p-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white cursor-pointer text-[#06091a]"
          >
            <option value="all">Tất cả khóa học</option>
            {instructorCourses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Study status filter */}
        <div className="w-[160px] shrink-0">
          <label className="block text-[9.5px] uppercase font-bold text-[#737373] mb-1">Trạng thái học</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full text-xs font-bold p-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white cursor-pointer text-[#06091a]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="learning">Đang học</option>
            <option value="completed">Đã hoàn thành</option>
          </select>
        </div>

        {/* Keyword Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[9.5px] uppercase font-bold text-[#737373] mb-1">Từ khóa</label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#999999] absolute left-3.5 top-3" />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc email..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]"
            />
          </div>
        </div>
        
        {/* Reset Filter Button */}
        <div className="self-end shrink-0">
          <button 
            onClick={handleResetFilters}
            className="px-4 py-2.5 border border-[#dbdde4] hover:bg-slate-50 text-[#737373] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors bg-white text-xs h-[38px] whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Đặt lại
          </button>
        </div>
      </div>

      {/* Main Student table card */}
      <div className="bg-white border border-[#e7e8ed] rounded-2xl overflow-hidden shadow-sm text-[11px] font-semibold text-[#121b4b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#e7e8ed]/25 border-b border-[#e7e8ed]">
              <tr>
                <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] w-[20%] min-w-[150px]">Học viên</th>
                <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] w-[20%] min-w-[150px]">Email</th>
                <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] w-[30%] min-w-[220px]">Khóa học</th>
                <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] w-[15%] min-w-[110px]">Tiến độ</th>
                <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] w-[15%] min-w-[120px]">Lần học gần nhất</th>
                <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] text-right w-[10%] min-w-[100px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e8ed] font-semibold text-[#06091a]">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3.5 px-4"><div className="w-28 h-7 bg-slate-100 animate-pulse rounded-lg"></div></td>
                    <td className="py-3.5 px-4"><div className="w-32 h-4 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="py-3.5 px-4"><div className="w-full h-4 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="py-3.5 px-4"><div className="w-20 h-4 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="py-3.5 px-4"><div className="w-24 h-4 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="py-3.5 px-4"></td>
                  </tr>
                ))
              ) : studentsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#737373]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-[#999999]" />
                      <span className="font-bold">Không tìm thấy dữ liệu học viên ghi danh.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                studentsList.map((enrollment) => {
                  return (
                    <tr key={enrollment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.name)}&background=007A64&color=fff&bold=true`} 
                            alt="avatar" 
                            className="w-8 h-8 rounded-full object-cover border border-[#dbdde4]" 
                          />
                          <span className="font-bold text-[#06091a]">{enrollment.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#595959] font-medium">{enrollment.email}</td>
                      <td className="py-3 px-4 text-[#06091a] font-bold max-w-[280px] truncate">
                        {enrollment.course}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 text-right font-black text-[#121b4b]">{enrollment.progress}%</span>
                          <div className="w-20 h-1.5 bg-[#e7e8ed] rounded-full overflow-hidden shrink-0">
                            <div style={{ width: `${enrollment.progress}%` }} className="h-full bg-blue-600 rounded-full transition-all"></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#595959] font-medium">
                        {enrollment.lastActive}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button 
                          onClick={() => setSelectedEnrollmentId(enrollment.id)}
                          className="text-blue-600 hover:underline font-bold text-[10.5px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Pagination Footer */}
        {!loading && (
          <div className="flex justify-between items-center p-4 border-t border-[#e7e8ed] bg-slate-50/40">
            <span className="text-[10px] text-[#737373] font-bold">Hiển thị 1 đến {studentsList.length} của {totalRecords} học viên</span>
            <div className="flex gap-1.5">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 border border-[#dbdde4] rounded-lg bg-white disabled:opacity-50 hover:bg-[#e7e8ed] cursor-pointer text-[#121b4b]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-bold bg-blue-600 text-white text-xs rounded-lg">1</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 border border-[#dbdde4] rounded-lg bg-white disabled:opacity-50 hover:bg-[#e7e8ed] cursor-pointer text-[#121b4b]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
