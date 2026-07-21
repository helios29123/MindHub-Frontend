import React, { useState, useEffect } from 'react';
import { 
  X, BookOpen, Clock, Award, CheckCircle2, Circle, PlayCircle, 
  FileText, Download, Sparkles, Loader2, Copy, Check, Phone, 
  Mail, Calendar, Play, FileCode, CheckCircle
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { INSTRUCTOR_STUDENTS_MOCK } from '../../data/instructorStudentsMock';

interface StudentDetailDrawerProps {
  enrollmentId: number;
  onClose: () => void;
}

export default function StudentDetailDrawer({ enrollmentId, onClose }: StudentDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'lessons' | 'activity'>('roadmap');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await ApiService.getInstructorLearnerDetails(enrollmentId);
        const apiData = res?.data || res;
        
        if (apiData && apiData.user && apiData.course) {
          setData(apiData);
        } else {
          // Fallback to INSTRUCTOR_STUDENTS_MOCK
          useMockData();
        }
      } catch (err) {
        console.error('Failed to fetch student details, using mock:', err);
        useMockData();
      } finally {
        setLoading(false);
      }
    };

    const useMockData = () => {
      const mockStudent = INSTRUCTOR_STUDENTS_MOCK.students.find(s => s.id === enrollmentId) || INSTRUCTOR_STUDENTS_MOCK.students[0];
      if (mockStudent) {
        setData({
          user: {
            name: mockStudent.name,
            email: mockStudent.email,
            phone: mockStudent.phone,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(mockStudent.name)}&background=007A64&color=fff&bold=true`
          },
          course: {
            title: mockStudent.course
          },
          enrollment: {
            enrolled_at: mockStudent.enrolledAt,
            status: mockStudent.progress >= 100 ? 'completed' : 'learning',
            progress: mockStudent.progress,
            last_accessed_at: mockStudent.lastActive,
            learning_duration: mockStudent.learningDuration,
            course_duration: mockStudent.courseDuration,
            enrollment_code: mockStudent.enrollmentCode,
            lessons_completed: mockStudent.lessonsCompleted,
            total_lessons: mockStudent.totalLessons
          },
          roadmap: mockStudent.lessonsTimeline,
          activities: mockStudent.activities
        });
      }
    };

    fetchDetails();
  }, [enrollmentId]);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate activities based on the mock or api data
  const activitiesList = React.useMemo(() => {
    if (!data) return [];
    if (data.activities) return data.activities;
    
    // Fallback dynamic generator if API returns standard items without custom activities
    const list: any[] = [];
    const isCompleted = data.enrollment?.status === 'completed' || Number(data.enrollment?.progress || 0) >= 100;
    
    if (isCompleted) {
      list.push({
        id: 'cert',
        title: 'Đã nhận chứng chỉ hoàn thành',
        desc: `Học viên đã hoàn thành xuất sắc tất cả bài học trong khóa "${data.course?.title}" và được cấp chứng chỉ hệ thống.`,
        time: 'Vừa xong',
        type: 'cert'
      });
    }

    list.push({
      id: 'act-1',
      title: 'Đã xem bài học mới nhất',
      desc: `Xem xong bài giảng video trong khóa học "${data.course?.title}".`,
      time: data.enrollment?.last_accessed_at || 'Mới đây',
      type: 'video'
    });

    list.push({
      id: 'act-2',
      title: 'Nộp bài tập thực hành',
      desc: 'Nộp bài tập thực hành của chương học hiện tại.',
      time: '1 ngày trước',
      type: 'assignment'
    });

    list.push({
      id: 'act-3',
      title: 'Tải tài liệu đính kèm',
      desc: 'Tải xuống tệp PDF tài nguyên học tập.',
      time: '3 ngày trước',
      type: 'resource'
    });

    return list;
  }, [data]);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-[#f8fafc] shadow-2xl z-[100] flex flex-col border-l border-[#e7e8ed] text-xs font-semibold text-[#121b4b] text-left animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-5 border-b border-[#e7e8ed] bg-white flex justify-between items-center shrink-0">
        <div>
          <h2 className="font-black text-sm text-[#06091a] uppercase tracking-wide">Thông tin học viên</h2>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 border border-[#dbdde4] rounded-full hover:bg-slate-50 text-[#737373] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 p-6 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#007A64]" />
        </div>
      ) : !data ? (
        <div className="flex-1 p-6 flex justify-center items-center text-[#737373] font-bold">
          Không thể tải dữ liệu chi tiết học viên.
        </div>
      ) : (
        <>
          {/* Student Profile Overview Card */}
          <div className="p-5 border-b border-[#e7e8ed] bg-white flex items-center gap-4 shrink-0">
            <img 
              src={data.user.avatar} 
              alt="avatar" 
              className="w-14 h-14 rounded-full object-cover border border-[#dbdde4]" 
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#06091a] tracking-tight truncate">{data.user.name}</h3>
                <span className={`inline-flex items-center bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wide shrink-0`}>
                  {data.enrollment?.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[#595959] text-[10.5px] font-medium mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{data.user.email}</span>
                <button 
                  onClick={() => handleCopyEmail(data.user.email)}
                  className="p-0.5 hover:bg-slate-100 rounded text-[#8c8c8c] hover:text-[#06091a] cursor-pointer"
                  title="Sao chép email"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {data.user.phone && (
                <div className="flex items-center gap-1.5 text-[#737373] text-[9.5px] font-medium mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{data.user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Enrollment Info Card */}
          <div className="p-4 bg-white border-b border-[#e7e8ed] grid grid-cols-2 gap-3 shrink-0 text-[10px]">
            <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#e7e8ed]">
              <span className="text-[#8c8c8c] font-bold block uppercase tracking-wide text-[8.5px]">Khóa học</span>
              <span className="text-[#06091a] font-bold block mt-1 truncate" title={data.course.title}>
                {data.course.title}
              </span>
            </div>
            <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#e7e8ed]">
              <span className="text-[#8c8c8c] font-bold block uppercase tracking-wide text-[8.5px]">Ngày ghi danh</span>
              <span className="text-[#06091a] font-bold block mt-1">
                {data.enrollment?.enrolled_at}
              </span>
            </div>
            <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#e7e8ed]">
              <span className="text-[#8c8c8c] font-bold block uppercase tracking-wide text-[8.5px]">Hình thức học</span>
              <span className="text-[#06091a] font-bold block mt-1">Online</span>
            </div>
            <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#e7e8ed]">
              <span className="text-[#8c8c8c] font-bold block uppercase tracking-wide text-[8.5px]">Mã ghi danh</span>
              <span className="text-[#06091a] font-bold block mt-1 truncate" title={data.enrollment?.enrollment_code}>
                {data.enrollment?.enrollment_code}
              </span>
            </div>
          </div>

          {/* Progress Card */}
          <div className="p-4 bg-white border-b border-[#e7e8ed] flex items-center gap-4 shrink-0">
            {/* Circle Progress bar */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                <circle cx="32" cy="32" r="28" stroke="#2563eb" strokeWidth="6" fill="transparent"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - (data.enrollment?.progress || 0) / 100)}
                  strokeLinecap="round" />
              </svg>
              <span className="absolute text-xs font-black text-[#121b4b]">
                {data.enrollment?.progress || 0}%
              </span>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 text-[10.5px]">
              <div>
                <span className="text-[#8c8c8c] font-bold uppercase tracking-wide text-[8px]">Bài giảng hoàn thành</span>
                <span className="text-[#06091a] font-bold block mt-0.5">
                  {data.enrollment?.lessons_completed || 43}/{data.enrollment?.total_lessons || 60}
                </span>
              </div>
              <div>
                <span className="text-[#8c8c8c] font-bold uppercase tracking-wide text-[8px]">Thời lượng đã học</span>
                <span className="text-[#06091a] font-bold block mt-0.5">
                  {data.enrollment?.learning_duration || '18h 45m'}
                </span>
              </div>
              <div>
                <span className="text-[#8c8c8c] font-bold uppercase tracking-wide text-[8px]">Thời lượng khóa học</span>
                <span className="text-[#06091a] font-bold block mt-0.5">
                  {data.enrollment?.course_duration || '25h 30m'}
                </span>
              </div>
              <div>
                <span className="text-[#8c8c8c] font-bold uppercase tracking-wide text-[8px]">Lần truy cập cuối</span>
                <span className="text-[#06091a] font-bold block mt-0.5 truncate" title={data.enrollment?.last_accessed_at}>
                  {data.enrollment?.last_accessed_at || 'Vừa xong'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs bar */}
          <div className="flex border-b border-[#e7e8ed] shrink-0 bg-white shadow-3xs">
            <button 
              onClick={() => setActiveTab('roadmap')}
              className={`flex-1 py-3 text-[10.5px] font-black uppercase text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'roadmap' 
                  ? 'border-[#007A64] text-[#007A64]' 
                  : 'border-transparent text-[#737373] hover:text-[#06091a]'
              }`}
            >
              Lộ trình học
            </button>
            <button 
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 py-3 text-[10.5px] font-black uppercase text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'lessons' 
                  ? 'border-[#007A64] text-[#007A64]' 
                  : 'border-transparent text-[#737373] hover:text-[#06091a]'
              }`}
            >
              Bài giảng
            </button>
            <button 
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-3 text-[10.5px] font-black uppercase text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'activity' 
                  ? 'border-[#007A64] text-[#007A64]' 
                  : 'border-transparent text-[#737373] hover:text-[#06091a]'
              }`}
            >
              Hoạt động gần đây
            </button>
          </div>

          {/* Scrollable Tab contents */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* Roadmap Tab */}
            {activeTab === 'roadmap' && (
              <div className="bg-white p-5 rounded-2xl border border-[#e7e8ed] shadow-3xs space-y-5">
                {(!data.roadmap || data.roadmap.length === 0) ? (
                  <p className="text-center text-[#737373] py-6 font-medium">Chưa có dữ liệu lộ trình học tập.</p>
                ) : (
                  <div className="relative border-l-2 border-slate-100 ml-2.5 space-y-6 text-xs text-[#121b4b]">
                    {data.roadmap.map((milestone: any, idx: number) => {
                      const isComp = milestone.status === 'completed';
                      const isPending = milestone.status === 'pending';
                      return (
                        <div key={idx} className="relative pl-6">
                          <div className={`absolute -left-[9px] top-0 bg-white rounded-full ${
                            isComp ? 'text-emerald-500' : isPending ? 'text-[#bfbfbf]' : 'text-blue-500'
                          }`}>
                            {isComp ? (
                              <CheckCircle className="w-4 h-4 bg-white" />
                            ) : (
                              <Circle className="w-4 h-4 bg-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-[#06091a] leading-tight text-[11.5px]">{milestone.title}</p>
                            <p className="text-[10px] text-[#737373] mt-1 font-medium">
                              {isComp ? 'Đã hoàn thành' : isPending ? 'Chưa bắt đầu' : 'Đang học'}
                              {milestone.lastActive && ` • ${milestone.lastActive}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Lessons List Tab */}
            {activeTab === 'lessons' && (
              <div className="bg-white p-4 rounded-2xl border border-[#e7e8ed] shadow-3xs space-y-3 text-xs text-[#121b4b]">
                <h4 className="font-black uppercase tracking-wider text-[10px] text-[#06091a] mb-2">Danh sách bài giảng chi tiết</h4>
                
                {/* Visualizing clean curriculum list */}
                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2"><Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> Bài 1.1: Giới thiệu về Python</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">Đã học</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2"><Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> Bài 1.2: Cài đặt môi trường IDE</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">Đã học</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2"><Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> Bài 2.1: Lists và Tuples trong Python</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">Đã học</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2"><Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> Bài 2.2: Dictionaries và Sets</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">Đã học</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2"><Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> Bài 3.1: Định nghĩa hàm với def</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">Đã học</span>
                  </div>
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2"><PlayCircle className="w-3.5 h-3.5 text-blue-600" /> Bài 3.2: Hàm trong Python</span>
                    <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold uppercase animate-pulse">Đang học</span>
                  </div>
                  <div className="p-3 bg-slate-50/30 border border-slate-100 rounded-xl flex items-center justify-between text-[#737373]">
                    <span className="font-medium flex items-center gap-2"><Circle className="w-3.5 h-3.5 text-[#a3a3a3]" /> Bài 4.1: Khái niệm Lớp và Đối tượng</span>
                    <span className="text-[10px] text-[#737373] bg-slate-100 px-2 py-0.5 rounded font-bold uppercase">Chưa học</span>
                  </div>
                </div>
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                {activitiesList.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#e7e8ed] p-6 text-center text-[#737373] font-medium">
                    Chưa ghi nhận hoạt động nào của học viên.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activitiesList.map((act: any) => {
                      let actIcon = <FileText className="w-4 h-4" />;
                      let colorClass = "bg-blue-50 text-blue-600 border-blue-200";
                      
                      if (act.type === 'video') {
                        actIcon = <PlayCircle className="w-4 h-4 text-blue-600" />;
                        colorClass = "bg-blue-50 text-blue-600 border-blue-200";
                      } else if (act.type === 'chapter') {
                        actIcon = <BookOpen className="w-4 h-4 text-amber-600" />;
                        colorClass = "bg-amber-50 text-amber-600 border-amber-200";
                      } else if (act.type === 'assignment') {
                        actIcon = <FileCode className="w-4 h-4 text-emerald-600" />;
                        colorClass = "bg-emerald-50 text-emerald-600 border-emerald-200";
                      } else if (act.type === 'resource') {
                        actIcon = <Download className="w-4 h-4 text-purple-600" />;
                        colorClass = "bg-purple-50 text-purple-600 border-purple-200";
                      } else if (act.type === 'cert') {
                        actIcon = <Award className="w-4 h-4 text-purple-600" />;
                        colorClass = "bg-purple-50 text-purple-600 border-purple-200";
                      }
                      
                      return (
                        <div 
                          key={act.id} 
                          className={`p-4 rounded-2xl border bg-white shadow-3xs flex gap-3 text-xs font-semibold`}
                        >
                          <div className={`shrink-0 p-2 rounded-xl h-9 w-9 flex items-center justify-center ${colorClass}`}>
                            {actIcon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline gap-2">
                              <h4 className="font-bold text-[#06091a] text-[11px] truncate leading-tight">{act.title}</h4>
                              <span className="text-[9.5px] text-[#737373] font-medium shrink-0">{act.time}</span>
                            </div>
                            <p className="text-[#595959] font-medium text-[10px] mt-1 leading-relaxed">{act.desc}</p>
                            
                            {/* Visual pill for nộp bài tập */}
                            {act.type === 'assignment' && (
                              <span className="inline-flex items-center gap-1 text-[8.5px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 px-2 py-0.5 rounded-lg mt-2 uppercase tracking-wide">
                                <Check className="w-3 h-3" /> Đạt
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Drawer footer */}
          <div className="p-4 border-t border-[#e7e8ed] bg-white flex justify-end shrink-0">
            <button 
              onClick={onClose} 
              className="px-5 py-2.5 border border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 rounded-xl font-bold transition-colors cursor-pointer bg-white text-xs"
            >
              Đóng
            </button>
          </div>
        </>
      )}

    </div>
  );
}
