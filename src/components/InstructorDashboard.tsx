import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, DollarSign, BookOpen, Clock, Plus, BarChart2, CheckCircle, 
  Settings, UserCheck, ShieldAlert, ArrowUpRight, FileText, Send, Trash2,
  Eye, EyeOff, Edit, PlusCircle, MinusCircle, Save, Check, ChevronRight, ChevronLeft,
  AlertTriangle, Play, HelpCircle, Lock, Sparkles, Upload, ArrowUp, ArrowDown, Shield, Key, Smartphone, Mail, X, List, AlertCircle, Search, LayoutDashboard, Activity, MessageSquare, Tag, Landmark, Bell, Filter
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import { User, Course, Chapter, Lesson, Quiz, QuizQuestion, PayoutRequest } from '../types';
import { safeLocalStorage as localStorage } from '../utils/safeStorage';
import { ApiService } from '../services/api';
import { InstructorRevenue } from './InstructorRevenue';
import { InstructorWithdrawal } from './InstructorWithdrawal';
import { InstructorQAModule } from '../features/QA';
import { InstructorRevenueChart } from './InstructorRevenueChart';
import TransactionManagement from './InstructorDashboard/TransactionManagement';
import { InstructorEnrollmentChart } from './InstructorEnrollmentChart';
import { InstructorTopCourses } from './InstructorTopCourses';
import { CouponManagement } from '../features/Coupons';
import CourseMediaStep from './instructor-course-form/CourseMediaStep';
import CourseCurriculumStep from './instructor-course-form/CourseCurriculumStep';
import StudentManagement from './InstructorDashboard/StudentManagement';
import InstructorProfilePage from './instructor-ui/InstructorProfilePage';

interface InstructorDashboardProps {
  currentUser: User;
  courses: Course[];
  onCreateCourseDraft: (newC: Course) => void;
  onUpdateCourse: (c: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onClose: () => void;
}

function InstructorSecurityPanel({ currentUser }: { currentUser: User }) {
  const [emailStatus, setEmailStatus] = useState(currentUser.isEmailVerified ? 'verified' : 'unverified');
  const [otpEnabled, setOtpEnabled] = useState(currentUser.isTwoFactorEnabled || false);
  const [otpStep, setOtpStep] = useState<'idle' | 'setup' | 'confirm'>('idle');
  const [otpCode, setOtpCode] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  
  const sessions = currentUser.activeSessions || [
    { id: '1', device: 'Windows PC', os: 'Windows 11', browser: 'Chrome', ip: '192.168.1.5', lastActive: 'Vừa xong', isCurrent: true },
    { id: '2', device: 'iPhone 14 Pro', os: 'iOS 16', browser: 'Safari', ip: '113.190.23.1', lastActive: '2 giờ trước', isCurrent: false }
  ];

  const handleVerifyEmail = async () => {
    setEmailStatus('pending');
    try {
      await ApiService.resendVerificationEmail(currentUser.email, 'verify_email');
      alert('Đã gửi email xác minh đến: ' + currentUser.email);
      setEmailStatus('unverified');
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi email');
      setEmailStatus('unverified');
    }
  };

  const handleEnableOtp = async () => {
    try {
      await ApiService.sendPhoneOtp(currentUser.phone || '', 'setup_2fa');
      setOtpStep('setup');
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi mã OTP');
    }
  };

  const handleConfirmOtp = async () => {
    if (otpCode.length === 6) {
      try {
        await ApiService.verifyPhoneOtp(currentUser.phone || '', otpCode, 'verify_phone');
        setOtpEnabled(true);
        setOtpStep('idle');
        alert('Đã bật xác thực 2 lớp thành công!');
        setOtpCode('');
      } catch (err: any) {
        alert(err.message || 'Mã OTP không hợp lệ!');
      }
    } else {
      alert('Mã OTP phải có 6 chữ số!');
    }
  };

  const handleDisableOtp = () => {
    if (window.confirm('Bạn có chắc chắn muốn tắt xác thực 2 lớp? Bảo mật tài khoản sẽ giảm xuống.')) {
      setOtpEnabled(false);
      alert('Đã tắt xác thực 2 lớp.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    setPasswordMsg('');
    alert('Đổi mật khẩu thành công!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const securityLevel = (emailStatus === 'verified' ? 1 : 0) + (otpEnabled ? 1 : 0) + (currentUser.lastPasswordChange ? 1 : 0);
  const securityScore = securityLevel >= 2 ? 'Tốt' : securityLevel === 1 ? 'Khuyến nghị' : 'Cơ bản';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3 border-b pb-4">
        <ShieldAlert className="w-8 h-8 text-brand-normal" />
        <div>
          <h2 className="text-xl font-bold">Bảo mật tài khoản Giảng viên</h2>
          <p className="text-sm text-stone-500">Quản lý các thiết lập bảo mật chuyên sâu cho tài khoản giảng viên.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột chính */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Email Verification */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${emailStatus === 'verified' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                <Mail className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Xác minh Email</h3>
                <p className="text-sm text-stone-600 mb-3">Email liên hệ và nhận thông báo chính thức.</p>
                <div className="bg-stone-50 p-3 rounded-lg border flex items-center justify-between">
                  <span className="font-medium">{currentUser.email}</span>
                  {emailStatus === 'verified' ? (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Đã xác minh</span>
                  ) : (
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">Chưa xác minh</span>
                  )}
                </div>
                {emailStatus !== 'verified' && (
                  <button 
                    onClick={handleVerifyEmail}
                    disabled={emailStatus === 'pending'}
                    className="mt-3 text-sm font-semibold text-brand-normal hover:underline disabled:opacity-50"
                  >
                    {emailStatus === 'pending' ? 'Đang gửi...' : 'Gửi lại email xác minh'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2FA OTP */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${otpEnabled ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-600'}`}>
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Xác thực 2 lớp (2FA/OTP)</h3>
                  {otpEnabled ? (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Đang bật</span>
                  ) : (
                    <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded">Đang tắt</span>
                  )}
                </div>
                <p className="text-sm text-stone-600 mt-1 mb-4">Bảo vệ tài khoản giảng viên của bạn bằng cách yêu cầu mã xác nhận từ SMS mỗi khi đăng nhập.</p>
                
                {!otpEnabled && otpStep === 'idle' && (
                  <button onClick={handleEnableOtp} className="bg-brand-normal text-brand-light font-bold py-2 px-4 rounded-lg text-sm">
                    Thiết lập Xác thực 2 lớp
                  </button>
                )}

                {otpStep === 'setup' && (
                  <div className="bg-stone-50 p-4 rounded-lg border space-y-4">
                    <p className="text-sm font-bold">Mã OTP đã được gửi về số điện thoại {currentUser.phone}</p>
                    <p className="text-sm font-bold">Nhập mã OTP gồm 6 chữ số</p>
                    <div className="flex gap-2 max-w-xs">
                      <input 
                        type="text" 
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center text-xl tracking-widest p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-normal focus:border-transparent" 
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleConfirmOtp} className="bg-brand-normal text-white font-bold py-2 px-4 rounded-lg">Xác nhận</button>
                      <button onClick={() => setOtpStep('idle')} className="bg-stone-200 text-stone-700 font-bold py-2 px-4 rounded-lg">Hủy</button>
                    </div>
                  </div>
                )}

                {otpEnabled && (
                  <button onClick={handleDisableOtp} className="bg-red-50 text-red-600 border border-red-200 font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-100">
                    Tắt Xác thực 2 lớp
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-stone-100 text-stone-600">
                <Key className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-4">Đổi mật khẩu</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Mật khẩu hiện tại</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full border rounded-lg p-2" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Mật khẩu mới</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border rounded-lg p-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Xác nhận mật khẩu</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border rounded-lg p-2" required />
                    </div>
                  </div>
                  {passwordMsg && <p className="text-xs text-red-500 font-semibold">{passwordMsg}</p>}
                  <button type="submit" className="bg-stone-800 text-white font-bold py-2 px-4 rounded-lg text-sm">Cập nhật mật khẩu</button>
                </form>
              </div>
            </div>
          </div>

        </div>

        {/* Cột phụ */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-stone-50 border rounded-xl p-5">
            <h3 className="font-bold mb-4">Tóm tắt bảo mật</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-600">Mức độ</span>
                <span className={`font-bold ${securityScore === 'Tốt' ? 'text-green-600' : 'text-amber-600'}`}>{securityScore}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-600">Email</span>
                <span className="font-semibold">{emailStatus === 'verified' ? 'Đã xác minh' : 'Chưa'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-600">2FA / OTP</span>
                <span className="font-semibold">{otpEnabled ? 'Đã bật' : 'Chưa bật'}</span>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2"><LaptopIcon /> Phiên đăng nhập</h3>
            <div className="space-y-4">
              {sessions.map(s => (
                <div key={s.id} className="border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-2">
                        {s.device} 
                        {s.isCurrent && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">Hiện tại</span>}
                      </p>
                      <p className="text-xs text-stone-500">{s.os} • {s.browser}</p>
                      <p className="text-xs text-stone-400 mt-1">Hoạt động: {s.lastActive} • IP: {s.ip}</p>
                    </div>
                    {!s.isCurrent && (
                      <button className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Đăng xuất thiết bị này">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm font-semibold text-brand-normal border border-brand-normal/20 py-2 rounded-lg hover:bg-brand-normal/5 transition-colors">
              Đăng xuất các thiết bị khác
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LaptopIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
  );
}


export default function InstructorDashboard({
  currentUser,
  courses,
  onCreateCourseDraft,
  onUpdateCourse,
  onDeleteCourse,
  onClose
}: InstructorDashboardProps) {
  
  // Tabs: 'overview' | 'revenue' | 'transactions' | 'courses' | 'grading' | 'qa' | 'builder' | 'students' | 'security' | 'coupons'
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'transactions' | 'courses' | 'grading' | 'qa' | 'builder' | 'students' | 'security' | 'coupons' | 'payout'>('overview');

  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [courseStatusFilter, setCourseStatusFilter] = useState('all');
  
  // --- BUILDER WIZARD STATES ---
  const [builderStep, setBuilderStep] = useState<number>(1);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  
  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Development'); // strictly 'Development' | 'Artificial Intelligence'
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState<number>(500000);
  const [salePrice, setSalePrice] = useState<number>(350000);
  const [image, setImage] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800');
  const [requirements, setRequirements] = useState<string[]>(['Có máy tính cá nhân kết nối Internet']);
  const [newRequirement, setNewRequirement] = useState('');
  const [slug, setSlug] = useState('');
  const [level, setLevel] = useState('beginner');
  const [language, setLanguage] = useState('vi');
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [willLearn, setWillLearn] = useState<string[]>(['Lập trình thành thạo ngôn ngữ ứng dụng với thực tế']);
  const [newWillLearn, setNewWillLearn] = useState('');

  // Step 2: Syllabus (Chapters & Lessons)
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  
  // Active Chapter Selected for Lesson management
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  
  // Lesson state inputs
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'video' | 'doc'>('video');
  const [newLessonDuration, setNewLessonDuration] = useState('15:00');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [newLessonDocContent, setNewLessonDocContent] = useState('');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [newLessonIsPreview, setNewLessonIsPreview] = useState<boolean>(false);

  // Simulated Video Uploading Space States
  const [isVideoUploading, setIsVideoUploading] = useState<boolean>(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);
  const [videoUploadStatus, setVideoUploadStatus] = useState<string>('');

  // Step 3: Quizzes
  const [newQuizQuestion, setNewQuizQuestion] = useState('');
  const [quizA, setQuizA] = useState('');
  const [quizB, setQuizB] = useState('');
  const [quizC, setQuizC] = useState('');
  const [quizD, setQuizD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Step 4: Settings (Student permissions)
  const [allowSkip, setAllowSkip] = useState<boolean>(true);
  const [allowDownload, setAllowDownload] = useState<boolean>(false);
  const [allowDiscussion, setAllowDiscussion] = useState<boolean>(true);
  const [giveCertificate, setGiveCertificate] = useState<boolean>(false);

  // Free previews & FAQs settings
  const [allowFreeDoc, setAllowFreeDoc] = useState<boolean>(false);
  const [allowFreeVideo, setAllowFreeVideo] = useState<boolean>(false);
  const [freeVideoDuration, setFreeVideoDuration] = useState<number>(30); // duration in seconds
  const [faqs, setFaqs] = useState<any[]>([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  

  const [gradingSubmissions, setGradingSubmissions] = useState([
    { id: 'sub-101', studentName: 'Student Test', email: 'student.test@mindhub.local', courseTitle: 'Chinh Phục React 19 & Next.js 15', lessonTitle: 'Bài tập 2.3: Validate Form Server Action', submittedValue: 'https://github.com/student/react19-form-test', points: null as number | null, feedback: '' }
  ]);

  // --- DYNAMIC STUDENT MANAGEMENT STATES ---
  const [selectedStudentCourseId, setSelectedStudentCourseId] = useState<string>('');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [studentFilterStatus, setStudentFilterStatus] = useState<string>('all');
  const [activeMessagingStudentId, setActiveMessagingStudentId] = useState<string | null>(null);
  const [directMessageText, setDirectMessageText] = useState<string>('');
  
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [enrollmentsMeta, setEnrollmentsMeta] = useState<any>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [studentPage, setStudentPage] = useState(1);
  const [studentLimit, setStudentLimit] = useState(10);
  const [studentMinProgress, setStudentMinProgress] = useState<number | undefined>();
  const [studentMaxProgress, setStudentMaxProgress] = useState<number | undefined>();
  const [studentTimeRange, setStudentTimeRange] = useState<string>('all');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);
  
  // REVENUE STATE
  const [revenueStats, setRevenueStats] = useState<{totalRevenue: number, totalGross: number, totalPlatformFee: number, totalTransactions: number, totalStudentsPaid: number}>({
    totalRevenue: 0, totalGross: 0, totalPlatformFee: 0, totalTransactions: 0, totalStudentsPaid: 0
  });
  const [overviewBalance, setOverviewBalance] = useState<number>(0);
  const [overviewUnansweredQA, setOverviewUnansweredQA] = useState<number>(0);

  // Fetch stats when user changes
  useEffect(() => {
    if (currentUser?.id && currentUser.role === 'instructor') {
      ApiService.getInstructorEnrollmentStats(currentUser.id).then(res => {
        setTotalEnrollments(res.totalEnrollments);
      }).catch(err => console.error("Error fetching enrollment stats", err));

      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      ApiService.getInstructorRevenueStats(currentUser.id, { startDate: firstDay }).then(res => {
        setRevenueStats(res);
      }).catch(err => console.error("Error fetching revenue stats", err));

      ApiService.getInstructorQAStats(currentUser.id).then(res => {
        setOverviewUnansweredQA(res.unansweredCount);
      }).catch(err => console.error("Error fetching qa stats", err));
    }
  }, [currentUser?.id]);

  // Fetch enrollments list when filters change
  useEffect(() => {
    if (!currentUser?.id || activeTab !== 'students') return;
    
    // Debounce logic for search inside effect
    const handler = setTimeout(() => {
      let startDate, endDate;
      const now = new Date();
      if (studentTimeRange === 'today') {
        startDate = new Date(now.setHours(0,0,0,0)).toISOString();
      } else if (studentTimeRange === 'week') {
        const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate = new Date(firstDay.setHours(0,0,0,0)).toISOString();
      } else if (studentTimeRange === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      } else if (studentTimeRange === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      }
      
      ApiService.getInstructorEnrollments(currentUser.id, {
        courseId: selectedStudentCourseId || 'all',
        status: studentFilterStatus,
        search: studentSearchQuery,
        minProgress: studentMinProgress,
        maxProgress: studentMaxProgress,
        startDate,
        endDate,
        page: studentPage,
        limit: studentLimit
      }).then(res => {
        setStudentsList(res.data);
        setEnrollmentsMeta(res.meta);
      }).catch(err => console.error("Error fetching enrollments", err));
    }, 500);

    return () => clearTimeout(handler);
  }, [currentUser?.id, activeTab, selectedStudentCourseId, studentFilterStatus, studentSearchQuery, studentMinProgress, studentMaxProgress, studentTimeRange, studentPage, studentLimit]);

  const allInstructorCourses = courses.filter(c => c.instructorId === currentUser.id || c.instructorName === currentUser.name);
  
  const baseOverviewStats = {
    total: allInstructorCourses.filter(c => !(c as any).deleted_at && c.status !== 'archived').length,
    published: allInstructorCourses.filter(c => !(c as any).deleted_at && (c.status === 'active' || (c.status as any) === 'published')).length,
    draft: allInstructorCourses.filter(c => !(c as any).deleted_at && c.status === 'draft').length,
    pending: allInstructorCourses.filter(c => !(c as any).deleted_at && (c.status === 'pending' || (c.status as any) === 'pending_review')).length,
    rejected: allInstructorCourses.filter(c => !(c as any).deleted_at && c.status === 'rejected').length,
  };

  const overviewStats = baseOverviewStats.total > 0 ? baseOverviewStats : {
    total: 12, published: 8, draft: 2, pending: 1, rejected: 1
  };

  const displayTotalEnrollments = totalEnrollments > 0 ? totalEnrollments : 1250;
  const displayTotalRevenue = revenueStats.totalRevenue > 0 ? revenueStats.totalRevenue : 45000000;
  const displayOverviewBalance = overviewBalance > 0 ? overviewBalance : 15500000;
  const displayOverviewUnansweredQA = overviewUnansweredQA > 0 ? overviewUnansweredQA : 5;

  const recentCourses = [...allInstructorCourses].sort((a, b) => {
    if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  }).slice(0, 5);

  const [courseFilterStatus, setCourseFilterStatus] = useState<string>('all');
  const instructorCourses = courseFilterStatus === 'all' 
    ? allInstructorCourses 
    : allInstructorCourses.filter(c => 
        courseFilterStatus === 'active' ? (c.status === 'active' || (c.status as any) === 'published') : 
        courseFilterStatus === 'pending' ? ((c.status as any) === 'pending_review' || c.status === 'pending') : 
        c.status === courseFilterStatus
      );

  const rawInstructorCourses = courses.filter(c => c.instructorName === currentUser.name && c.status !== 'archived');
  const filteredInstructorCourses = rawInstructorCourses.filter(c => {
    if (courseSearchQuery.trim() && !c.title.toLowerCase().includes(courseSearchQuery.toLowerCase())) {
      return false;
    }
    if (courseStatusFilter === 'all') return true;
    if (courseStatusFilter === 'draft') return c.status === 'draft';
    if (courseStatusFilter === 'pending') return c.status === 'pending';
    if (courseStatusFilter === 'rejected') return c.status === 'rejected';
    if (courseStatusFilter === 'active') return c.status === 'active' && !c.isHidden;
    if (courseStatusFilter === 'hidden') return c.isHidden;
    return true;
  });
  const totalStudents = rawInstructorCourses.reduce((sum, c) => sum + c.enrolledCount, 0);
  const mockupAverageCompletion = Math.round(rawInstructorCourses.reduce((sum, c) => sum + c.completionRate, 0) / (rawInstructorCourses.length || 1));

  // --- AUTO PROGRESS PERSISTENCE ---
  useEffect(() => {
    // Attempt auto load progress draft from localStorage
    const savedDraft = localStorage.getItem('mindhub_course_creation_draft');
    if (savedDraft) {
      try {
        const data = JSON.parse(savedDraft);
        // We do not load automatically to prevent overriding, but offer a recovery button
      } catch (err) {}
    }
  }, []);

  // Save current step variables to draft state
  const handleSaveDraftToLocal = () => {
    const draftData = {
      title, subtitle, description, category, subcategory, price, salePrice, image,
      requirements, willLearn, chapters, allowSkip, allowDownload, allowDiscussion, giveCertificate
    };
    localStorage.setItem('mindhub_course_creation_draft', JSON.stringify(draftData));
    alert('Đã lưu nháp trạng thái hiện tại thành công vào bộ nhớ trình duyệt! Bạn có thể khôi phục tiến độ bất kỳ lúc nào.');
  };

  const handleRestoreDraftFromLocal = () => {
    const savedDraft = localStorage.getItem('mindhub_course_creation_draft');
    if (!savedDraft) {
      alert('Không tìm thấy bản nháp lưu trữ nào gần đây.');
      return;
    }
    try {
      const data = JSON.parse(savedDraft);
      setTitle(data.title || '');
      setSubtitle(data.subtitle || '');
      setDescription(data.description || '');
      setCategory(data.category || 'Development');
      setSubcategory(data.subcategory || '');
      setPrice(data.price || 500000);
      setSalePrice(data.salePrice || 350000);
      setImage(data.image || '');
      setRequirements(data.requirements || []);
      setWillLearn(data.willLearn || []);
      setChapters(data.chapters || []);
      setAllowSkip(data.allowSkip !== undefined ? data.allowSkip : true);
      setAllowDownload(data.allowDownload || false);
      setAllowDiscussion(data.allowDiscussion !== undefined ? data.allowDiscussion : true);
      setGiveCertificate(data.giveCertificate || false);
      alert('Đã đồng bộ và khôi phục bản nháp khóa học thành công!');
    } catch (e) {
      alert('Gặp lỗi khi giải mã bản nháp lưu trữ.');
    }
  };

  const handleAddNewRequirement = () => {
    if (!newRequirement.trim()) return;
    setRequirements([...requirements, newRequirement.trim()]);
    setNewRequirement('');
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleAddNewWillLearn = () => {
    if (!newWillLearn.trim()) return;
    setWillLearn([...willLearn, newWillLearn.trim()]);
    setNewWillLearn('');
  };

  const handleRemoveWillLearn = (idx: number) => {
    setWillLearn(willLearn.filter((_, i) => i !== idx));
  };

  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) return;
    const newCh: Chapter = {
      id: 'ch-' + Date.now(),
      title: newChapterTitle.trim(),
      lessons: []
    };
    setChapters([...chapters, newCh]);
    setSelectedChapterIndex(chapters.length);
    setNewChapterTitle('');
  };

  const handleRemoveChapter = (chapterIdx: number) => {
    setChapters(chapters.filter((_, idx) => idx !== chapterIdx));
    if (selectedChapterIndex >= chapterIdx && selectedChapterIndex > 0) {
      setSelectedChapterIndex(selectedChapterIndex - 1);
    }
  };

  const moveChapter = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === chapters.length - 1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...chapters];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setChapters(updated);
    setSelectedChapterIndex(targetIdx);
  };

  const handleAddLessonToChapter = () => {
    if (!newLessonTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài học.');
      return;
    }
    if (chapters.length === 0) {
      alert('Hãy khởi tạo ít nhất một chương học trước.');
      return;
    }

    if (editingLessonId) {
      // Edit mode: Update existing lesson
      const updated = chapters.map((ch, idx) => {
        if (idx === selectedChapterIndex) {
          return {
            ...ch,
            lessons: ch.lessons.map(l => l.id === editingLessonId ? {
              ...l,
              title: newLessonTitle.trim(),
              type: newLessonType,
              duration: newLessonDuration || '15:00',
              videoUrl: newLessonType === 'video' ? newLessonVideoUrl : undefined,
              docContent: newLessonType === 'doc' ? newLessonDocContent : undefined,
              content: newLessonType === 'doc' ? newLessonDocContent : 'Bài học video từ giảng viên.',
              isPreview: newLessonIsPreview,
            } : l)
          };
        }
        return ch;
      });

      setChapters(updated);
      setNewLessonTitle('');
      setNewLessonVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
      setNewLessonDocContent('');
      setNewLessonIsPreview(false);
      setEditingLessonId(null);
      alert('Đề cương bài học đã được cập nhật thành công!');
    } else {
      // Add mode: Create new lesson
      const newLesId = 'les-' + Date.now();
      const newLes: Lesson = {
        id: newLesId,
        title: newLessonTitle.trim(),
        type: newLessonType,
        duration: newLessonDuration || '10:00',
        videoUrl: newLessonType === 'video' ? newLessonVideoUrl : undefined,
        docContent: newLessonType === 'doc' ? newLessonDocContent : undefined,
        content: newLessonType === 'doc' ? newLessonDocContent : 'Bài học video từ giảng viên.',
        quiz: undefined,
        isPreview: newLessonIsPreview,
      };

      const updated = chapters.map((ch, idx) => {
        if (idx === selectedChapterIndex) {
          return {
            ...ch,
            lessons: [...ch.lessons, newLes]
          };
        }
        return ch;
      });

      setChapters(updated);
      setNewLessonTitle('');
      setNewLessonVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
      setNewLessonDocContent('');
      setNewLessonIsPreview(false);
      alert('Đã thêm bài học vào giáo trình thành công!');
    }
  };

  const handleSimulateVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVideoUploading(true);
    setVideoUploadProgress(0);
    setVideoUploadStatus('Khởi tạo kết nối lưu trữ media...');

    // If Mode is Mock, we want to simulate some progression with descriptive status.
    // If Mode is API, ApiService.uploadLessonVideo will directly execute an actual XMLHttpRequest with progress events!
    const isMock = ApiService.getConfig().mode === 'mock';
    
    if (isMock) {
      let currentProg = 0;
      const interval = setInterval(() => {
        currentProg += 15 + Math.floor(Math.random() * 12);
        if (currentProg >= 100) {
          currentProg = 100;
          clearInterval(interval);
          setVideoUploadProgress(100);
          setVideoUploadStatus('Đã kết hợp luồng m3u8! Đang lưu dạng Adaptive HLS...');
          
          setTimeout(() => {
            setIsVideoUploading(false);
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            setNewLessonVideoUrl(`https://mindhub-cdn.example.com/videos/${Date.now()}_${sanitizedName}/stream.m3u8`);
            setNewLessonTitle(prev => prev || file.name.substring(0, file.name.lastIndexOf('.')) || 'Bài học video mới');
            setNewLessonDuration('12:45');
            alert(`🎉 [MOCK] Đã upload video "${file.name}" thành công theo chuẩn truyền phát HLS DRM!`);
          }, 1000);
        } else {
          setVideoUploadProgress(currentProg);
          if (currentProg > 75) {
            setVideoUploadStatus(`Đang chuyển mã video adaptive... (${currentProg}%)`);
          } else if (currentProg > 40) {
            setVideoUploadStatus(`Đang truyền phân đoạn chunk video... (${currentProg}%)`);
          } else {
            setVideoUploadStatus(`Đang phân cấp bitrate tối ưu... (${currentProg}%)`);
          }
        }
      }, 200);
    } else {
      // Real API Upload
      ApiService.uploadLessonVideo(file, (progress, status) => {
        setVideoUploadProgress(progress);
        setVideoUploadStatus(status);
      })
      .then(res => {
        setIsVideoUploading(false);
        setNewLessonVideoUrl(res.videoUrl);
        setNewLessonTitle(prev => prev || file.name.substring(0, file.name.lastIndexOf('.')) || 'Bài học video mới');
        setNewLessonDuration(res.duration || '12:45');
        alert(`🎉 [REAL API] Đã xử lý & upload video "${file.name}" thành công! \nĐường dẫn stream: ${res.videoUrl}`);
      })
      .catch(err => {
        setIsVideoUploading(false);
        alert(`❌ Tải video lỗi: ${err.message}. \nHãy kiểm tra cấu hình CORS/Base URL ở tab Kết nối Backend API.`);
      });
    }
  };

  const handleRemoveLesson = (chapterIdx: number, lesId: string) => {
    setChapters(chapters.map((ch, idx) => {
      if (idx === chapterIdx) {
        return {
          ...ch,
          lessons: ch.lessons.filter(l => l.id !== lesId)
        };
      }
      return ch;
    }));
  };

  // Quick simulation of file upload (.doc Content template)
  const handleSimulateDocUpload = () => {
    const simulatedDocContents = 
`[TÀI LIỆU DỰ ÁN MINDHUB]
ĐỀ CƯƠNG CHI TIẾT VÀ BÀI TẬP VỀ NHÀ

1. KHÁI NIỆM TRỌNG TÂM:
Học phần này giới thiệu về các cấu trúc rèn luyện, liên hoan nâng cao hiệu năng trong viết code Javascript và kiến trúc hướng luồng.

2. CÁC BƯỚC THỰC HIỆN:
- Bước 1: Khởi tạo Project & cấu hình package.json
- Bước 2: Thiết kế sơ đồ quan hệ database thực thể
- Bước 3: Triển khai kiểm tra logic bảo mât API endpoints.

3. ĐỀ BÀI SÁT HẠCH:
Hãy viết một hàm đệ quy để giải quyết bài toán lồng thư mục và tối ưu hóa thời gian chạy O(n).`;

    setNewLessonDocContent(simulatedDocContents);
    setNewLessonType('doc');
    setNewLessonDuration('15 phút');
    alert('Đã tải lên và đọc nội dung văn bản gốc từ file Word .doc thành công!');
  };

  const handleAddQuizToLesson = (chapterIdx: number, lessonId: string) => {
    if (!newQuizQuestion.trim()) {
      alert('Vui lòng soạn câu hỏi trắc nghiệm.');
      return;
    }
    if (!quizA || !quizB) {
      alert('Cần tối thiểu hai phương án đáp án A và B.');
      return;
    }

    const newQuestion: QuizQuestion = {
      id: 'q-' + Date.now(),
      question: newQuizQuestion,
      options: [quizA, quizB, quizC || 'Không có', quizD || 'Không có'],
      correctIndex: correctAnswer === 'A' ? 0 : correctAnswer === 'B' ? 1 : correctAnswer === 'C' ? 2 : 3,
      explanation: 'Đáp án chính xác do giảng viên thẩm duyệt thiết lập.'
    };

    setChapters(chapters.map((ch, idx) => {
      if (idx === chapterIdx) {
        return {
          ...ch,
          lessons: ch.lessons.map(les => {
            if (les.id === lessonId) {
              const currentQuiz = les.quiz || { id: 'qz-' + Date.now(), title: 'Bài tập trắc nghiệm khái niệm', questions: [] as QuizQuestion[] };
              return {
                ...les,
                quiz: {
                  id: currentQuiz.id,
                  title: currentQuiz.title,
                  questions: [...currentQuiz.questions, newQuestion]
                }
              };
            }
            return les;
          })
        };
      }
      return ch;
    }));

    setNewQuizQuestion('');
    setQuizA('');
    setQuizB('');
    setQuizC('');
    setQuizD('');
    alert('Đã tích hợp câu hỏi Quiz trắc nghiệm thành công!');
  };

  // Launch unified wizard screen
  const startBuilderForCreate = () => {
    
    setEditingCourseId(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setCategory('Development');
    setSubcategory('');
    setPrice(500000);
    setSalePrice(350000);
    setImage('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800');
    setRequirements(['Có máy tính cá nhân kết nối Internet']);
    setWillLearn(['Lập trình thành thạo ngôn ngữ ứng dụng với thực tế']);
    setChapters([]);
    setAllowSkip(true);
    setAllowDownload(false);
    setAllowDiscussion(true);
    setGiveCertificate(false);
    setAllowFreeDoc(false);
    setAllowFreeVideo(false);
    setFreeVideoDuration(30);
    setFaqs([]);
    setSlug('');
    setLevel('beginner');
    setLanguage('vi');
    setIntroVideoUrl('');
    setBuilderStep(1);
    setActiveTab('builder');
  };

  const startBuilderForEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setTitle(course.title);
    setSubtitle(course.subtitle || '');
    setDescription(course.description || '');
    setCategory(course.category || 'Development');
    setSubcategory(course.subcategory || '');
    setPrice(course.price || 0);
    setSalePrice(course.salePrice || course.price);
    setImage(course.image);
    setRequirements(course.requirements || []);
    setWillLearn(course.willLearn || []);
    setChapters(course.chapters || []);
    setAllowSkip(course.allowSkip !== undefined ? course.allowSkip : true);
    setAllowDownload(course.allowDownload || false);
    setAllowDiscussion(course.allowDiscussion !== undefined ? course.allowDiscussion : true);
    setGiveCertificate(course.giveCertificate || false);
    setAllowFreeDoc(course.allowFreeDoc || false);
    setAllowFreeVideo(course.allowFreeVideo || false);
    setFreeVideoDuration(course.freeVideoDuration || 30);
    setFaqs(course.faqs || []);
    setSlug(course.slug || '');
    setLevel(course.level || 'beginner');
    setLanguage(course.language || 'vi');
    setIntroVideoUrl(course.introVideoUrl || '');
    setBuilderStep(1);
    setActiveTab('builder');
  };

  const handleFinishCoursePublish = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Vui lòng hoàn thành điền Tên khóa học và Mô tả ở Bước 1 trước khi xuất bản.');
      setBuilderStep(1);
      return;
    }

    const payload: Course = {
      id: editingCourseId || 'course-' + Date.now(),
      title,
      subtitle: subtitle || 'Nhãn phụ chi tiết khóa học mới',
      description,
      category,
      subcategory: subcategory || 'Chuyên gia nâng cao',
      price,
      salePrice,
      rating: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.rating || 4.8) : 5.0,
      reviewCount: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.reviewCount || 1) : 0,
      enrolledCount: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.enrolledCount || 10) : 0,
      completionRate: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.completionRate || 92) : 0,
      image,
      instructorId: currentUser.id,
      instructorName: currentUser.name,
      instructorTitle: 'Giảng viên chuyên môn tại MindHub',
      instructorAvatar: currentUser.avatar,
      instructorBio: currentUser.bio || 'Chuyên gia giảng dạy công nghệ thực tiễn.',
      chapters,
      requirements,
      willLearn,
      status: 'pending', // Pending moderator review workflow
      allowSkip,
      allowDownload,
      allowDiscussion,
      giveCertificate,
      allowFreeDoc,
      allowFreeVideo,
      freeVideoDuration,
      reviews: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.reviews || []) : [],
      faqs: faqs,
      isHidden: false,
      slug,
      level,
      language,
      introVideoUrl
    };

    if (editingCourseId) {
      onUpdateCourse(payload);
      alert('Đã cập nhật chỉnh sửa khóa học thành công! Giáo án đã được chuyển sang trạng thái chờ duyệt thẩm định.');
    } else {
      onCreateCourseDraft(payload);
      alert('Đã khởi tạo khóa học mới thành công! Giáo án đã được chuyển lên Ban Kế Hoạch Kiểm Duyệt thẩm định xuất bản.');
    }

    // Clean up local storage drafting states
    localStorage.removeItem('mindhub_course_creation_draft');
    setActiveTab('courses');
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleGradeSubmission = (submissionId: string, points: number, feedback: string) => {
    setGradingSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return { ...s, points, feedback };
      }
      return s;
    }));
    alert(`Đã chấm điểm thành công: ${points}/100!`);
  };

  const mockRevenueData = [
    { name: '01/05', value: 20000000 },
    { name: '06/05', value: 22000000 },
    { name: '11/05', value: 21000000 },
    { name: '16/05', value: 30000000 },
    { name: '21/05', value: 35000000 },
    { name: '26/05', value: 41000000 },
    { name: '31/05', value: 42680000 }
  ];

  const mockEnrollmentsData = [
    { name: '01/05', value: 150 },
    { name: '06/05', value: 180 },
    { name: '11/05', value: 165 },
    { name: '16/05', value: 280 },
    { name: '21/05', value: 298 },
    { name: '26/05', value: 320 },
    { name: '31/05', value: 356 }
  ];

  const unansweredQuestionsMock = [
    {
      id: 'q1',
      userName: 'Trần Quốc Bảo',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      courseTitle: 'Lập trình Python cơ bản từ A-Z',
      question: 'Anh ơi, em bị lỗi ModuleNotFoundError: No module named \'numpy\' khi chạy bài tập, phải xử lý sao ạ?',
      time: '2 giờ trước'
    },
    {
      id: 'q2',
      userName: 'Nguyễn Thị Lan',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      courseTitle: 'Thiết kế UI/UX với Figma',
      question: 'Em không tìm thấy plugin Auto Layout, anh hướng dẫn cách cài đặt với ạ?',
      time: '5 giờ trước'
    },
    {
      id: 'q3',
      userName: 'Lê Minh Hiếu',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
      courseTitle: 'Marketing Digital thực chiến 2025',
      question: 'Phần chạy quảng cáo Facebook, ngân sách tối ưu là bao nhiêu ạ?',
      time: '1 ngày trước'
    }
  ];

  const incompleteCoursesMock = [
    { id: 'ic1', title: 'Lập trình Python nâng cao', progress: 65 },
    { id: 'ic2', title: 'Data Analysis với Excel & Power BI', progress: 40 }
  ];

  const notificationsMock = [
    { id: 'n1', content: 'Khóa học "Lập trình Python cơ bản từ A-Z" của bạn vừa có đánh giá mới 5*', time: '2 giờ trước' },
    { id: 'n2', content: 'MindHub sẽ bảo trì hệ thống vào 02:00 - 04:00 ngày 25/05/2025', time: '1 ngày trước' },
    { id: 'n3', content: 'Chương trình ưu đãi tháng 5: Giảm 30% phí rút tiền cho giảng viên', time: '2 ngày trước' }
  ];

  const topCourses = useMemo(() => {
    const sorted = [...allInstructorCourses].sort((a, b) => b.enrolledCount - a.enrolledCount);
    if (sorted.length > 0) return sorted.slice(0, 5);
    return [
      { id: 'mc1', title: 'Lập trình Python cơ bản từ A-Z', level: 'Cơ bản', enrolledCount: 532, price: 499000, image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800' },
      { id: 'mc2', title: 'Thiết kế UI/UX với Figma cho người mới bắt đầu', level: 'Trung cấp', enrolledCount: 298, price: 799000, image: 'https://images.unsplash.com/photo-1613909207039-6b173b755cc1?auto=format&fit=crop&q=80&w=800' },
      { id: 'mc3', title: 'Marketing Digital thực chiến 2025', level: 'Nâng cao', enrolledCount: 187, price: 699000, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800' },
      { id: 'mc4', title: 'Excel nâng cao cho người đi làm', level: 'Trung cấp', enrolledCount: 142, price: 599000, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800' },
      { id: 'mc5', title: 'Tiếng Anh giao tiếp cho người bận rộn', level: 'Cơ bản', enrolledCount: 89, price: 399000, image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800' }
    ];
  }, [allInstructorCourses]);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-main-darker animate-fade-in font-sans instructor-theme">
      <div className="flex min-h-screen w-full flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-[240px] shrink-0 sticky top-0 md:h-screen bg-white border-b md:border-b-0 md:border-r border-slate-100 p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          {/* Logo Branding */}
          <div className="hidden md:flex items-center gap-2 px-2 pb-5 border-b mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-sm font-black tracking-wide text-stone-900 leading-none">MindHub</h1>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Instructor</span>
            </div>
          </div>

          {/* Buttons List */}
          <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1.5 md:gap-1 scrollbar-none scroll-smooth">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 shrink-0 transition-all ${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-stone-600 hover:bg-slate-50'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Tổng quan
            </button>
            
            <button 
              onClick={() => setActiveTab('courses')}
              className={`whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 shrink-0 transition-all ${activeTab === 'courses' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-stone-600 hover:bg-slate-50'}`}
            >
              <BookOpen className="w-4 h-4" /> Khóa học của tôi
            </button>

            <button 
              onClick={startBuilderForCreate}
              className={`whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 shrink-0 transition-all ${activeTab === 'builder' && builderStep < 5 ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-stone-600 hover:bg-slate-50'}`}
            >
              <Plus className="w-4 h-4" /> Tạo khóa học
            </button>

            <button 
              onClick={() => {
                if (allInstructorCourses.length > 0) {
                  startBuilderForEdit(allInstructorCourses[0]);
                  setBuilderStep(5);
                } else {
                  alert("Bạn chưa có khóa học nào để chỉnh sửa bài học. Hãy tạo khóa học trước.");
                }
              }}
              className={`whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 shrink-0 transition-all ${activeTab === 'builder' && builderStep === 5 ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-stone-600 hover:bg-slate-50'}`}
            >
              <FileText className="w-4 h-4" /> Nội dung bài học
            </button>
            
            <button 
              onClick={() => setActiveTab('qa')}
              className={`whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 shrink-0 transition-all ${activeTab === 'qa' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-stone-600 hover:bg-slate-50'}`}
            >
              <MessageSquare className="w-4 h-4" /> Hỏi đáp & Bình luận
            </button>

            <button 
              onClick={() => setActiveTab('students')}
              className={`whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 shrink-0 transition-all ${activeTab === 'students' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-stone-600 hover:bg-slate-50'}`}
            >
              <Users className="w-4 h-4" /> Học viên
            </button>

            <button 
              onClick={() => setActiveTab('revenue')}
              className={`whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 shrink-0 transition-all ${activeTab === 'revenue' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-stone-600 hover:bg-slate-50'}`}
            >
              <BarChart2 className="w-4 h-4" /> Doanh thu
            </button>

            <button 
              onClick={() => setActiveTab('payout')}
              className={`whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 shrink-0 transition-all ${activeTab === 'payout' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-stone-600 hover:bg-slate-50'}`}
            >
              <DollarSign className="w-4 h-4" /> Rút tiền
            </button>

            <button 
              onClick={() => setActiveTab('coupons')}
              className={`whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 shrink-0 transition-all ${activeTab === 'coupons' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-stone-600 hover:bg-slate-50'}`}
            >
              <Tag className="w-4 h-4" /> Mã giảm giá
            </button>

            <button 
              onClick={() => setActiveTab('security')}
              className={`whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 shrink-0 transition-all ${activeTab === 'security' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-stone-600 hover:bg-slate-50'}`}
            >
              <UserCheck className="w-4 h-4" /> Hồ sơ
            </button>

          </div>
        </div>

        {/* Sidebar Footer Upgrades */}
        <div className="hidden md:block space-y-4">
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-left">
            <h4 className="font-extrabold text-[11px] text-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-emerald-200 text-emerald-600" /> Nâng cấp tài khoản
            </h4>
            <p className="text-[9.5px] text-emerald-600/80 font-medium mt-1 leading-relaxed">
              Mở khóa các tính năng nâng cao dành cho giảng viên.
            </p>
            <button className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1.5 rounded-lg transition-colors shadow-3xs">
              Nâng cấp ngay
            </button>
          </div>

          <div 
            onClick={() => alert("Chuyển hướng đến help.mindhub.vn")}
            className="flex items-center justify-between p-2 border-t text-stone-500 hover:text-stone-850 transition-colors cursor-pointer text-[10px] font-bold"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-stone-400" />
              <div>
                <p className="leading-none text-stone-700">Trung tâm hỗ trợ</p>
                <p className="text-[8px] text-stone-400 font-medium mt-0.5">help.mindhub.vn</p>
              </div>
            </span>
            <ChevronRight className="w-3 h-3 text-stone-450" />
          </div>
        </div>
      </aside>

      {/* Main Content Area Container */}
      <main className="flex-1 min-w-0 flex flex-col bg-slate-50/40">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400">Giảng viên</span>
            <ChevronRight className="w-3 h-3 text-stone-300" />
            <span className="text-xs font-extrabold text-stone-750">
              {activeTab === 'overview' ? 'Tổng quan' :
               activeTab === 'courses' ? 'Khóa học của tôi' :
               activeTab === 'builder' ? 'Nội dung bài học' :
               activeTab === 'qa' ? 'Hỏi đáp & Bình luận' :
               activeTab === 'students' ? 'Học viên' :
               activeTab === 'revenue' ? 'Doanh thu' :
               activeTab === 'payout' ? 'Rút tiền' :
               activeTab === 'coupons' ? 'Mã giảm giá' : 'Hồ sơ'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="text-[10px] font-bold text-stone-600 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-stone-500" /> Xem trang học viên
            </button>
            
            <div className="relative cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-colors">
              <Bell className="w-4 h-4 text-stone-600" />
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[7.5px] text-white font-black">
                5
              </span>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-100" />
            
            <div className="flex items-center gap-2">
              <img src={currentUser.avatar} alt="avatar" className="w-8 h-8 rounded-full border object-cover" />
              <div className="text-left hidden sm:block">
                <p className="text-[10.5px] font-extrabold text-stone-850 leading-none">{currentUser.name}</p>
                <span className="text-[8px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold px-1.5 py-0.2 rounded mt-0.5 inline-block uppercase">Giảng viên</span>
              </div>
            </div>
          </div>
        </header>

        {/* Vùng nội dung chính */}
        <div className="w-full p-6 space-y-6">
          
          {/* Defs for chart gradients */}
          <svg className="hidden">
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
          </svg>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in text-xs text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">
                    Tổng quan giảng viên 👋
                  </h3>
                  <p className="text-[10px] text-stone-400 font-bold mt-1">Chào mừng bạn quay lại, {currentUser.name}!</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-3">
                {/* Card 1: Tổng khóa học */}
                <div 
                  onClick={() => { setActiveTab('courses'); setCourseStatusFilter('all'); }}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-450">Tổng khóa học</span>
                    <div className="p-1 bg-emerald-55 rounded text-emerald-600"><BookOpen className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-stone-850">{overviewStats.total}</h4>
                    <p className="text-[8.5px] text-emerald-650 font-bold mt-0.5">↑ 2 so với tháng trước</p>
                  </div>
                </div>

                {/* Card 2: Đang Published */}
                <div 
                  onClick={() => { setActiveTab('courses'); setCourseStatusFilter('active'); }}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-450">Đã xuất bản</span>
                    <div className="p-1 bg-emerald-55 rounded text-emerald-600"><CheckCircle className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-stone-850">{overviewStats.published}</h4>
                    <p className="text-[8.5px] text-emerald-655 font-bold mt-0.5">↑ 1 so với tháng trước</p>
                  </div>
                </div>

                {/* Card 3: Khóa Draft */}
                <div 
                  onClick={() => { setActiveTab('courses'); setCourseStatusFilter('draft'); }}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-455">Bản nháp</span>
                    <div className="p-1 bg-slate-50 rounded text-stone-500"><FileText className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-stone-850">{overviewStats.draft}</h4>
                    <p className="text-[8.5px] text-stone-400 font-bold mt-0.5">→ 0 so với tháng trước</p>
                  </div>
                </div>

                {/* Card 4: Đang chờ duyệt */}
                <div 
                  onClick={() => { setActiveTab('courses'); setCourseStatusFilter('pending'); }}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-450">Chờ duyệt</span>
                    <div className="p-1 bg-amber-50 rounded text-amber-600"><Clock className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-stone-850">{overviewStats.pending}</h4>
                    <p className="text-[8.5px] text-stone-400 font-bold mt-0.5">→ 0 so với tháng trước</p>
                  </div>
                </div>

                {/* Card 5: Bị từ chối */}
                <div 
                  onClick={() => { setActiveTab('courses'); setCourseStatusFilter('rejected'); }}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-450">Bị từ chối</span>
                    <div className="p-1 bg-rose-50 rounded text-rose-600"><AlertCircle className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-stone-850">{overviewStats.rejected}</h4>
                    <p className="text-[8.5px] text-stone-400 font-bold mt-0.5">→ 0 so với tháng trước</p>
                  </div>
                </div>

                {/* Card 6: Tổng học viên */}
                <div 
                  onClick={() => setActiveTab('students')}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-450">Tổng học viên</span>
                    <div className="p-1 bg-blue-50 rounded text-blue-600"><Users className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-stone-850">{formatNumber(displayTotalEnrollments)}</h4>
                    <p className="text-[8.5px] text-emerald-650 font-bold mt-0.5">↑ 156 so với tháng trước</p>
                  </div>
                </div>

                {/* Card 7: Doanh thu tháng này */}
                <div 
                  onClick={() => setActiveTab('revenue')}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-450">Doanh thu</span>
                    <div className="p-1 bg-emerald-55 rounded text-emerald-600"><DollarSign className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-black text-emerald-700">{formatVND(displayTotalRevenue)}</h4>
                    <p className="text-[8.5px] text-emerald-650 font-bold mt-0.5">↑ 18% so với tháng trước</p>
                  </div>
                </div>

                {/* Card 8: Số dư có thể rút */}
                <div 
                  onClick={() => setActiveTab('payout')}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-450">Số dư rút</span>
                    <div className="p-1 bg-indigo-55 rounded text-indigo-600"><Landmark className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-black text-indigo-700">{formatVND(displayOverviewBalance)}</h4>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveTab('payout'); }}
                      className="text-[8.5px] text-blue-600 font-bold mt-0.5 hover:underline flex items-center gap-0.5"
                    >
                      Rút tiền ngay &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* Revenue chart */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs text-left space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Doanh thu (tháng này)</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-black text-stone-850">{formatVND(displayTotalRevenue)}</span>
                        <span className="bg-emerald-50 text-emerald-700 text-[8.5px] font-black px-1.5 py-0.5 rounded border border-emerald-100">+ 18% so với tháng trước</span>
                      </div>
                    </div>
                    <select className="border border-slate-150 rounded-lg p-1 text-[9.5px] font-bold bg-white focus:outline-none cursor-pointer">
                      <option>Tháng này</option>
                      <option>Tuần này</option>
                      <option>Năm nay</option>
                    </select>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockRevenueData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#a8a29e" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a8a29e" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000000}M`} />
                        <ChartTooltip formatter={(value: any) => formatVND(Number(value))} labelStyle={{ fontSize: '9px', fontWeight: 'bold' }} contentStyle={{ fontSize: '9px' }} />
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Enrollments chart */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs text-left space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Lượt ghi danh (học viên mới)</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-black text-stone-850">356</span>
                        <span className="bg-emerald-50 text-emerald-700 text-[8.5px] font-black px-1.5 py-0.5 rounded border border-emerald-100">+ 12% so với tháng trước</span>
                      </div>
                    </div>
                    <select className="border border-slate-150 rounded-lg p-1 text-[9.5px] font-bold bg-white focus:outline-none cursor-pointer">
                      <option>Tháng này</option>
                      <option>Tuần này</option>
                      <option>Năm nay</option>
                    </select>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockEnrollmentsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#a8a29e" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a8a29e" fontSize={9} tickLine={false} axisLine={false} />
                        <ChartTooltip labelStyle={{ fontSize: '9px', fontWeight: 'bold' }} contentStyle={{ fontSize: '9px' }} />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEnrollments)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Top Courses, QA, Incomplete & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                {/* Top Courses */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs text-left space-y-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-extrabold text-xs text-stone-850">Top khóa học nhiều học viên</h4>
                    <button onClick={() => setActiveTab('courses')} className="text-[10px] text-blue-600 hover:underline font-bold">Xem tất cả</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="text-stone-400 border-b">
                          <th className="py-2 text-left font-bold w-6">#</th>
                          <th className="py-2 text-left font-bold">Khóa học</th>
                          <th className="py-2 text-center font-bold">Học viên</th>
                          <th className="py-2 text-right font-bold">Doanh thu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {topCourses.map((c, idx) => (
                          <tr key={c.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 font-bold text-stone-500">{idx + 1}</td>
                            <td className="py-2.5 font-bold text-stone-800 flex items-center gap-2">
                              <img src={c.image} alt="" className="w-8 h-6 object-cover rounded border bg-white shrink-0" />
                              <div className="truncate max-w-[100px]">
                                <p className="truncate leading-tight font-extrabold">{c.title}</p>
                                <span className={`text-[7px] uppercase font-bold px-1 rounded inline-block mt-0.5 ${c.level === 'Cơ bản' ? 'bg-emerald-50 text-emerald-700' : c.level === 'Nâng cao' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                  {c.level}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 text-center font-bold text-stone-750">{c.enrolledCount}</td>
                            <td className="py-2.5 text-right font-black text-emerald-650">{formatVND(c.enrolledCount * (c.price || 499000))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Unanswered QAs */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs text-left space-y-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-extrabold text-xs text-stone-850 flex items-center gap-1.5">
                      <span>Câu hỏi chưa trả lời</span>
                      <span className="bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">12</span>
                    </h4>
                    <button onClick={() => setActiveTab('qa')} className="text-[10px] text-blue-600 hover:underline font-bold">Xem tất cả</button>
                  </div>
                  <div className="space-y-3 flex-1 py-1">
                    {unansweredQuestionsMock.map((q) => (
                      <div key={q.id} className="flex gap-3 items-start p-2 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition-all border border-slate-100/50">
                        <img src={q.avatar} alt="" className="w-7 h-7 rounded-full border object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-850 text-[10.5px]">{q.userName}</span>
                            <span className="text-[8px] text-stone-400 font-bold">{q.time}</span>
                          </div>
                          <p className="text-[8px] text-emerald-600 font-bold truncate mt-0.5">trong {q.courseTitle}</p>
                          <p className="text-[9.5px] text-stone-600 truncate mt-1 leading-normal font-medium">{q.question}</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 self-center" />
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveTab('qa')} 
                    className="w-full text-center py-2 border border-slate-150 rounded-xl hover:bg-slate-50 text-[10.5px] font-bold text-stone-600 transition-colors"
                  >
                    Xem tất cả câu hỏi
                  </button>
                </div>

                {/* Rightmost column: Incomplete courses & Alerts */}
                <div className="space-y-4 text-left">
                  
                  {/* Khóa học cần hoàn thiện */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-extrabold text-xs text-stone-850 flex items-center gap-1.5">
                        <span>Khóa học cần hoàn thiện</span>
                        <span className="bg-amber-500 text-white font-black text-[9px] px-1 rounded">2</span>
                      </h4>
                      <button onClick={() => setActiveTab('courses')} className="text-[10px] text-blue-600 hover:underline font-bold">Xem tất cả</button>
                    </div>
                    <div className="space-y-3.5 py-1">
                      {incompleteCoursesMock.map(ic => (
                        <div key={ic.id} className="space-y-1.5">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-stone-800 text-[10px] truncate max-w-[130px]">{ic.title}</span>
                            <button 
                              onClick={() => {
                                const found = allInstructorCourses.find(c => c.title.toLowerCase().includes('python'));
                                if (found) startBuilderForEdit(found);
                              }}
                              className="text-[9px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-stone-600 border border-slate-200 px-2 py-0.5 rounded transition-all cursor-pointer font-bold"
                            >
                              Tiếp tục
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-stone-100 h-1.5 rounded-full overflow-hidden">
                              <div style={{ width: `${ic.progress}%` }} className="bg-emerald-500 h-full rounded-full" />
                            </div>
                            <span className="text-[8.5px] font-bold text-stone-400 font-mono">Đã hoàn thành {ic.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Thông báo mới */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-extrabold text-xs text-stone-850 flex items-center gap-1.5">
                        <span>Thông báo mới</span>
                        <span className="bg-blue-500 text-white font-black text-[9px] px-1.5 rounded">3</span>
                      </h4>
                      <button onClick={() => alert("Mở trang thông báo")} className="text-[10px] text-blue-600 hover:underline font-bold">Xem tất cả</button>
                    </div>
                    <div className="space-y-3 py-1">
                      {notificationsMock.map(n => (
                        <div key={n.id} className="flex gap-2 items-start text-[10px]">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-stone-700 leading-normal font-medium">{n.content}</p>
                            <span className="text-[8px] text-stone-400 font-bold block mt-0.5">{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}


        {/* REVENUE TAB */}
        {activeTab === 'revenue' && (
          <InstructorRevenue instructorId={currentUser?.id} courses={courses} />
        )}

        {/* LIST OF COURSES TAB */}
        {activeTab === 'courses' && (
          <div className="space-y-6 animate-fade-in text-xs text-left">
            
            {/* Header: Title, Subtitle, Button */}
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-base font-extrabold text-stone-900">
                  Khóa học của tôi
                </h3>
                <p className="text-[10px] text-stone-400 font-bold mt-1">Quản lý và theo dõi tất cả các khóa học của bạn trên MindHub.</p>
              </div>
              <button 
                onClick={startBuilderForCreate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-3xs transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tạo khóa học
              </button>
            </div>

            {/* Metrics cards row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs flex flex-col justify-between h-20">
                <span className="text-[9px] uppercase font-bold text-stone-450 block">Tất cả khóa học</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-black text-stone-800">{rawInstructorCourses.length}</span>
                  <span className="text-[8px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">↑ 12%</span>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs flex flex-col justify-between h-20">
                <span className="text-[9px] uppercase font-bold text-stone-450 block">Published</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-black text-emerald-600">
                    {rawInstructorCourses.filter(c => c.status === 'active').length}
                  </span>
                  <span className="text-[8px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">↑ 18%</span>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs flex flex-col justify-between h-20">
                <span className="text-[9px] uppercase font-bold text-stone-455 block">Draft</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-black text-stone-600">
                    {rawInstructorCourses.filter(c => c.status === 'draft').length}
                  </span>
                  <span className="text-[8px] text-stone-550 font-bold bg-slate-50 px-1 rounded">→ 2%</span>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs flex flex-col justify-between h-20">
                <span className="text-[9px] uppercase font-bold text-stone-450 block">Pending Review</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-black text-purple-600">
                    {rawInstructorCourses.filter(c => c.status === 'pending').length}
                  </span>
                  <span className="text-[8px] text-purple-600 font-bold bg-purple-50 px-1 rounded">↑ 1%</span>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs flex flex-col justify-between h-20">
                <span className="text-[9px] uppercase font-bold text-stone-450 block">Rejected</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-black text-rose-600">
                    {rawInstructorCourses.filter(c => c.status === 'rejected').length}
                  </span>
                  <span className="text-[8px] text-stone-450 font-bold bg-slate-50 px-1 rounded">→ 0%</span>
                </div>
              </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Trạng thái dropdown */}
                <div className="flex flex-col">
                  <span className="text-[8.5px] text-stone-400 font-bold uppercase mb-1">Trạng thái</span>
                  <select
                    value={courseStatusFilter}
                    onChange={e => setCourseStatusFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-[10px] font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="draft">Đang hoàn thiện</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                    <option value="active">Đang công khai</option>
                    <option value="hidden">Đã ẩn</option>
                  </select>
                </div>

                {/* Danh mục dropdown */}
                <div className="flex flex-col">
                  <span className="text-[8.5px] text-stone-400 font-bold uppercase mb-1">Danh mục</span>
                  <select
                    className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-[10px] font-bold focus:outline-none cursor-pointer"
                  >
                    <option>Tất cả danh mục</option>
                    <option>Lập trình & Công nghệ</option>
                    <option>Trí tuệ nhân tạo (AI)</option>
                  </select>
                </div>

                {/* Từ khóa */}
                <div className="flex flex-col flex-1 min-w-[200px]">
                  <span className="text-[8.5px] text-stone-400 font-bold uppercase mb-1">Từ khóa</span>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm khóa học..."
                      value={courseSearchQuery}
                      onChange={e => setCourseSearchQuery(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[10px] font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-2.5 self-end">
                {/* Sắp xếp */}
                <div className="flex flex-col">
                  <span className="text-[8.5px] text-stone-400 font-bold uppercase mb-1">Sắp xếp</span>
                  <select
                    className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-[10px] font-bold focus:outline-none cursor-pointer"
                  >
                    <option>Cập nhật gần nhất</option>
                    <option>Mới nhất</option>
                    <option>Nhiều học viên nhất</option>
                  </select>
                </div>
                {/* Bộ lọc button */}
                <button className="border border-slate-200 hover:bg-slate-50 p-2 rounded-lg flex items-center justify-center shrink-0 cursor-pointer h-[28px] w-[32px]">
                  <Filter className="w-4 h-4 text-stone-500" />
                </button>
              </div>
            </div>

            {/* Content Row: Table (Left) & Sidebar (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* Table side (span 3) */}
              <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl shadow-3xs overflow-hidden">
                {filteredInstructorCourses.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50">
                    <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                    <p className="text-stone-500 font-medium text-xs">Không tìm thấy khóa học nào khớp với bộ lọc.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10.5px]">
                      <thead>
                        <tr className="bg-slate-50/50 text-stone-400 border-b">
                          <th className="p-3.5 font-bold">Khóa học</th>
                          <th className="p-3.5 font-bold">Cấp độ</th>
                          <th className="p-3.5 font-bold">Giá</th>
                          <th className="p-3.5 font-bold">Trạng thái</th>
                          <th className="p-3.5 font-bold text-center">Học viên</th>
                          <th className="p-3.5 font-bold text-right">Doanh thu</th>
                          <th className="p-3.5 font-bold">Cập nhật gần nhất</th>
                          <th className="p-3.5 font-bold text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredInstructorCourses.map(course => {
                          const courseLevelLabel = 
                            course.level === 'beginner' || course.level === 'Cơ bản' ? 'Cơ bản' :
                            course.level === 'expert' || course.level === 'Nâng cao' ? 'Nâng cao' : 'Trung cấp';
                          
                          const levelColorClass =
                            courseLevelLabel === 'Cơ bản' ? 'bg-emerald-50 text-emerald-700' :
                            courseLevelLabel === 'Nâng cao' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700';

                          return (
                            <tr key={course.id} className="hover:bg-slate-50/40">
                              <td className="p-3.5 font-bold text-stone-850 flex items-center gap-3">
                                <img src={course.image} alt="" className="w-16 h-11 object-cover rounded-lg border bg-white shrink-0" />
                                <div className="max-w-[150px]">
                                  <p className="font-extrabold truncate text-[10.5px] leading-tight text-stone-900">{course.title}</p>
                                  <span className="text-[8px] text-stone-400 font-semibold">{course.category === 'Development' ? 'Lập trình' : 'Trí tuệ nhân tạo (AI)'}</span>
                                </div>
                              </td>
                              
                              <td className="p-3.5 font-bold">
                                <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full ${levelColorClass}`}>
                                  {courseLevelLabel}
                                </span>
                              </td>
                              
                              <td className="p-3.5 font-black text-stone-800">
                                {formatVND(course.salePrice || course.price || 0)}
                              </td>

                              <td className="p-3.5 font-bold">
                                <span className="flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    course.status === 'active' ? 'bg-emerald-500' :
                                    course.status === 'rejected' ? 'bg-rose-500' :
                                    course.status === 'draft' ? 'bg-amber-500' : 'bg-purple-500'
                                  }`} />
                                  <span className="text-[9.5px]">
                                    {course.status === 'active' ? 'Published' :
                                     course.status === 'rejected' ? 'Rejected' :
                                     course.status === 'draft' ? 'Draft' : 'Pending Review'}
                                  </span>
                                </span>
                              </td>

                              <td className="p-3.5 font-black text-center text-stone-700">
                                {formatNumber(course.enrolledCount)}
                              </td>

                              <td className="p-3.5 font-black text-right text-emerald-650">
                                {formatVND(course.enrolledCount * (course.salePrice || course.price || 499000))}
                              </td>

                              <td className="p-3.5 font-bold text-stone-400">
                                {course.createdAt ? new Date(course.createdAt).toLocaleDateString('vi-VN') : '20/05/2025'}
                              </td>

                              <td className="p-3.5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {course.status === 'rejected' && (
                                    <button 
                                      onClick={() => alert(`Lý do từ chối: ${course.rejectionReason || 'Không có lý do chi tiết.'}`)}
                                      className="text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-2 py-1 rounded-lg text-[9px] font-bold transition-all"
                                    >
                                      Xem lý do
                                    </button>
                                  )}

                                  {course.status === 'draft' && (
                                    <button 
                                      onClick={() => {
                                        if (window.confirm('Bạn có muốn gửi khóa học này cho Admin duyệt không?')) {
                                          onUpdateCourse({ ...course, status: 'pending' });
                                          alert('Đã gửi yêu cầu duyệt khóa học thành công!');
                                        }
                                      }}
                                      className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-2 py-1 rounded-lg text-[9px] font-bold transition-all"
                                    >
                                      Gửi duyệt
                                    </button>
                                  )}

                                  <button 
                                    onClick={() => startBuilderForEdit(course)}
                                    className="text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 px-2 py-1 rounded-lg text-[9px] font-bold transition-all"
                                  >
                                    Chỉnh sửa
                                  </button>

                                  <button 
                                    onClick={() => {
                                      if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn khóa học này? Thao tác này không thể thu hồi.')) {
                                        onDeleteCourse(course.id);
                                      }
                                    }}
                                    className="text-rose-600 hover:bg-rose-50 p-1 rounded-lg border border-transparent hover:border-rose-100 font-bold"
                                    title="Xóa khóa học"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Pagination */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-stone-500">
                  <span>Hiển thị 1 - {filteredInstructorCourses.length} trên {filteredInstructorCourses.length} khóa học</span>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 border rounded-lg hover:bg-white bg-slate-50 text-stone-400" disabled>&lt;</button>
                    <button className="px-2.5 py-1 border rounded-lg bg-emerald-600 text-white">1</button>
                    <button className="p-1.5 border rounded-lg hover:bg-white bg-slate-50 text-stone-400" disabled>&gt;</button>
                  </div>
                </div>
              </div>
              {/* Sidebar side (span 1) */}
              <div className="space-y-4">
                
                {/* Performance Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs text-left space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-extrabold text-xs text-stone-850">Hiệu suất khóa học</h4>
                    <span className="text-[8.5px] text-stone-400 font-bold">7 ngày qua</span>
                  </div>
                  <div className="space-y-3 text-[11px]">
                    <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                      <div>
                        <span className="text-stone-450 text-[9px] uppercase font-bold block leading-none">Lượt xem</span>
                        <span className="font-black text-stone-800 text-sm mt-1 block">12.345</span>
                      </div>
                      <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] font-bold">↑ 15.2%</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                      <div>
                        <span className="text-stone-450 text-[9px] uppercase font-bold block leading-none">Lượt đăng ký</span>
                        <span className="font-black text-stone-800 text-sm mt-1 block">432</span>
                      </div>
                      <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] font-bold">↑ 12.8%</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                      <div>
                        <span className="text-stone-450 text-[9px] uppercase font-bold block leading-none">Doanh thu</span>
                        <span className="font-black text-stone-800 text-sm mt-1 block">28.750.000đ</span>
                      </div>
                      <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] font-bold">↑ 18.6%</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                      <div>
                        <span className="text-stone-450 text-[9px] uppercase font-bold block leading-none">Đánh giá mới</span>
                        <span className="font-black text-stone-800 text-sm mt-1 block">56</span>
                      </div>
                      <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] font-bold">↑ 7.5%</span>
                    </div>
                  </div>
                </div>

                {/* Mẹo Giảng Viên */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs text-left space-y-3 relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-emerald-100/30 rounded-full shrink-0 flex items-center justify-center text-emerald-600 text-3xl">🎓</div>
                  <h4 className="font-extrabold text-xs text-stone-850 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                    <span>Mẹo giảng viên</span>
                  </h4>
                  <p className="text-[10px] text-stone-600 leading-relaxed font-medium">
                    Hoàn thiện đầy đủ danh sách checklist trước khi gửi duyệt sẽ giúp nâng cao tỷ lệ phê duyệt của ban chuyên môn.
                  </p>
                  <button 
                    onClick={() => alert("Xem tài liệu hướng dẫn")}
                    className="text-[10px] text-emerald-700 hover:underline font-extrabold flex items-center gap-0.5"
                  >
                    Xem hướng dẫn &rarr;
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* --- DEDICATED STEPS COURSE BUILDER PAGE - MATCHES MOCKUP 3 --- */}
        {activeTab === 'builder' && (() => {
          // Calculate checklist progress dynamically
          const hasTitle = !!title.trim();
          const hasSlug = !!slug.trim();
          const hasShortDesc = !!subtitle.trim();
          const hasDesc = !!description.trim();
          const hasLevel = !!level;
          const hasLanguage = !!language;
          
          let totalChapters = chapters.length;
          let totalLessons = 0;
          let totalDurationSeconds = 0;
          let freePreviewsCount = 0;
          let totalAssetsCount = 0;
          
          chapters.forEach(ch => {
            if (ch.lessons) {
              totalLessons += ch.lessons.length;
              ch.lessons.forEach((l: any) => {
                totalDurationSeconds += l.video_duration_seconds || 0;
                if (l.is_preview) freePreviewsCount++;
                if (l.resources) totalAssetsCount += l.resources.length;
              });
            }
          });

          const hasThumbnail = !!image;
          const hasIntroVideo = !!introVideoUrl;
          const hasOutcomes = willLearn.length > 0 && willLearn.every(x => x.trim().length > 0);
          const hasRequirements = requirements.length > 0 && requirements.every(x => x.trim().length > 0);
          const hasPrice = price > 0 || (salePrice !== null && salePrice > 0);

          // Missing Items list
          const missingItems: string[] = [];
          if (!hasOutcomes) missingItems.push('Mục tiêu học tập');
          if (!hasRequirements) missingItems.push('Yêu cầu đầu vào');
          if (!hasThumbnail) missingItems.push('Thumbnail khóa học');
          if (!hasIntroVideo) missingItems.push('Video giới thiệu');
          if (!hasPrice) missingItems.push('Giá khuyến mãi hoặc giá gốc');
          if (totalChapters === 0) missingItems.push('Ít nhất 1 chương học');
          if (totalLessons === 0) missingItems.push('Ít nhất 1 bài giảng');

          // Completed Items list
          const completedItems: string[] = [];
          if (hasTitle) completedItems.push('Tiêu đề khóa học');
          if (hasSlug) completedItems.push('Slug (đường dẫn)');
          if (category) completedItems.push('Danh mục');
          if (level) completedItems.push('Cấp độ');
          if (hasShortDesc) completedItems.push('Mô tả ngắn');
          if (hasDesc) completedItems.push('Mô tả chi tiết');

          const totalChecks = 11;
          const passedChecks = totalChecks - missingItems.length;
          const checklistProgress = Math.round((passedChecks / totalChecks) * 100);

          const handleSaveDraft = async () => {
            try {
              const payload: Course = {
                id: editingCourseId || 'course-' + Date.now(),
                title,
                subtitle: subtitle || 'Nhãn phụ chi tiết khóa học mới',
                description,
                category,
                subcategory: subcategory || 'Chuyên gia nâng cao',
                price,
                salePrice,
                rating: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.rating || 4.8) : 5.0,
                reviewCount: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.reviewCount || 1) : 0,
                enrolledCount: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.enrolledCount || 10) : 0,
                completionRate: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.completionRate || 92) : 0,
                image,
                instructorId: currentUser.id,
                instructorName: currentUser.name,
                instructorTitle: 'Giảng viên chuyên môn tại MindHub',
                instructorAvatar: currentUser.avatar,
                instructorBio: currentUser.bio || 'Chuyên gia giảng dạy công nghệ thực tiễn.',
                chapters,
                requirements,
                willLearn,
                status: 'draft',
                allowSkip: true,
                allowDownload: false,
                allowDiscussion: true,
                giveCertificate: false,
                allowFreeDoc: false,
                allowFreeVideo: false,
                freeVideoDuration: 30,
                reviews: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.reviews || []) : [],
                faqs: [],
                isHidden: false,
                slug,
                level,
                language,
                introVideoUrl
              };
              if (editingCourseId) {
                onUpdateCourse(payload);
              } else {
                onCreateCourseDraft(payload);
              }
              alert('Lưu bản nháp khóa học thành công!');
            } catch (err) {
              alert('Có lỗi xảy ra khi lưu nháp.');
            }
          };

          const handleNext = () => {
            if (builderStep < 5) setBuilderStep(builderStep + 1);
          };
          const handlePrev = () => {
            if (builderStep > 1) setBuilderStep(builderStep - 1);
          };

          const steps = [
            { id: 1, label: 'Thông tin cơ bản' },
            { id: 2, label: 'Mục tiêu & yêu cầu' },
            { id: 3, label: 'Giá bán' },
            { id: 4, label: 'Hình ảnh & video giới thiệu' },
            { id: 5, label: 'Nội dung & gửi duyệt' }
          ];

          return (
            <div className="space-y-6 animate-fade-in text-xs text-left bg-slate-50/50 p-5 rounded-2xl border border-stone-200 font-sans">
              
              {/* Stepper Header Bar */}
              <div className="flex justify-between items-center select-none pb-2 border-b border-slate-100">
                <button 
                  onClick={() => {
                    if (window.confirm('Quay lại danh sách khóa học và bỏ qua tất cả chưa lưu?')) setActiveTab('courses');
                  }}
                  className="text-[10px] font-black text-stone-450 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  &larr; Quay lại khóa học
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-full shadow-3xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-stone-550 font-bold text-[9.5px]">Đã tự động lưu nháp</span>
                  </div>
                  <button 
                    onClick={handleSaveDraft}
                    className="border border-[#10b981] text-[#10b981] hover:bg-emerald-50 px-4 py-1.5 rounded-xl font-bold text-[10.5px] cursor-pointer shadow-3xs transition-all"
                  >
                    Lưu nháp
                  </button>
                </div>
              </div>

              {/* Stepper Navigation Grid */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs">
                {steps.map((stepItem, idx) => {
                  const isActive = builderStep === stepItem.id;
                  const isFinished = builderStep > stepItem.id;
                  return (
                    <React.Fragment key={stepItem.id}>
                      <button
                        type="button"
                        onClick={() => setBuilderStep(stepItem.id)}
                        className="flex items-center gap-2 cursor-pointer focus:outline-none whitespace-nowrap"
                      >
                        {isFinished ? (
                          <span className="flex items-center gap-1 text-[#10b981] font-bold">
                            <CheckCircle className="w-4 h-4 text-[#10b981] fill-[#e6f4ea] shrink-0" />
                            {stepItem.label}
                          </span>
                        ) : isActive ? (
                          <span className="flex items-center gap-1.5 text-stone-850 font-black">
                            <span className="w-5 h-5 rounded-full bg-[#10b981] text-white flex items-center justify-center text-[10px] font-black shadow-3xs">{stepItem.id}</span>
                            {stepItem.label}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-stone-400 font-bold hover:text-stone-600">
                            <span className="w-5 h-5 rounded-full bg-stone-50 border border-stone-200 text-stone-400 flex items-center justify-center text-[10px] font-bold">{stepItem.id}</span>
                            {stepItem.label}
                          </span>
                        )}
                      </button>
                      {idx < steps.length - 1 && (
                        <div className={`h-[1px] flex-1 min-w-[20px] ${isFinished ? 'bg-[#10b981]' : 'bg-slate-100'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Steps forms wrapper */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs">
                
                {/* Step 1: Basic info */}
                {builderStep === 1 && (
                  <div className="space-y-4">
                    <div className="border-b pb-2 mb-2">
                      <h2 className="text-sm font-black text-stone-850">Thông tin cơ bản</h2>
                      <p className="text-[10.5px] text-stone-400 font-medium mt-1">Cung cấp thông tin tổng quan về khóa học của bạn.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Tiêu đề khóa học *</label>
                        <input 
                          type="text" 
                          value={title}
                          onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                          placeholder="Lập trình Python cơ bản cho người mới bắt đầu"
                          className="w-full text-[11px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50/20 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Slug (đường dẫn) *</label>
                        <input 
                          type="text" 
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="lap-trinh-python-co-ban-cho-nguoi-moi-bat-dau"
                          className="w-full text-[11px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50/20 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Danh mục *</label>
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full text-[11px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="Development">Lập trình & Công nghệ</option>
                          <option value="Artificial Intelligence">Trí tuệ nhân tạo (AI)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Cấp độ *</label>
                        <select 
                          value={level}
                          onChange={(e) => setLevel(e.target.value)}
                          className="w-full text-[11px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="beginner">Cơ bản</option>
                          <option value="intermediate">Trung cấp</option>
                          <option value="expert">Nâng cao</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Ngôn ngữ *</label>
                        <select 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full text-[11px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="vi">Tiếng Việt</option>
                          <option value="en">Tiếng Anh</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Mô tả ngắn *</label>
                      <textarea 
                        rows={2}
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="Khóa học giúp bạn nắm vững kiến thức nền tảng Python từ cơ bản đến thực hành..."
                        className="w-full text-[11px] font-medium text-stone-700 border border-slate-200 rounded-xl p-3 bg-slate-50/20 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Mô tả chi tiết *</label>
                      <textarea 
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Soạn nội dung chi tiết bài học..."
                        className="w-full text-[11px] font-medium text-stone-700 border border-slate-200 rounded-xl p-3 bg-slate-50/20 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Outcomes and requirements */}
                {builderStep === 2 && (
                  <div className="space-y-4">
                    <div className="border-b pb-2 mb-2">
                      <h2 className="text-sm font-black text-stone-850">Mục tiêu & yêu cầu</h2>
                      <p className="text-[10.5px] text-stone-400 font-medium mt-1">Xác định mục tiêu đầu ra và các yêu cầu chuẩn bị.</p>
                    </div>

                    <div className="space-y-4">
                      {/* outcomes */}
                      <div className="space-y-2">
                        <label className="block text-[10.5px] font-bold text-stone-600">Mục tiêu học tập *</label>
                        <div className="space-y-2">
                          {willLearn.map((goal, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input 
                                type="text"
                                value={goal}
                                onChange={(e) => {
                                  const updated = [...willLearn];
                                  updated[idx] = e.target.value;
                                  setWillLearn(updated);
                                }}
                                className="flex-1 text-[11px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/10 focus:outline-none"
                              />
                              <button 
                                type="button"
                                onClick={() => setWillLearn(prev => prev.filter((_, i) => i !== idx))}
                                className="p-2 text-rose-500 hover:bg-rose-50 border border-transparent rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <div className="flex gap-2 mt-2">
                            <input 
                              type="text" 
                              placeholder="Thêm mục tiêu học tập..."
                              value={newWillLearn}
                              onChange={(e) => setNewWillLearn(e.target.value)}
                              className="flex-1 text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/20 focus:outline-none"
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                if (newWillLearn.trim()) {
                                  setWillLearn(prev => [...prev, newWillLearn.trim()]);
                                  setNewWillLearn('');
                                }
                              }}
                              className="bg-[#e6f4ea] border border-emerald-100 hover:bg-[#cbeed4] text-[#10b981] text-[11.5px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                            >
                              Thêm
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* requirements */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <label className="block text-[10.5px] font-bold text-stone-600">Yêu cầu chuẩn bị đầu vào *</label>
                        <div className="space-y-2">
                          {requirements.map((req, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input 
                                type="text"
                                value={req}
                                onChange={(e) => {
                                  const updated = [...requirements];
                                  updated[idx] = e.target.value;
                                  setRequirements(updated);
                                }}
                                className="flex-1 text-[11px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/10 focus:outline-none"
                              />
                              <button 
                                type="button"
                                onClick={() => setRequirements(prev => prev.filter((_, i) => i !== idx))}
                                className="p-2 text-rose-500 hover:bg-rose-50 border border-transparent rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <div className="flex gap-2 mt-2">
                            <input 
                              type="text" 
                              placeholder="Thêm yêu cầu chuẩn bị..."
                              value={newRequirement}
                              onChange={(e) => setNewRequirement(e.target.value)}
                              className="flex-1 text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/20 focus:outline-none"
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                if (newRequirement.trim()) {
                                  setRequirements(prev => [...prev, newRequirement.trim()]);
                                  setNewRequirement('');
                                }
                              }}
                              className="bg-[#e6f4ea] border border-emerald-100 hover:bg-[#cbeed4] text-[#10b981] text-[11.5px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                            >
                              Thêm
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Pricing */}
                {builderStep === 3 && (
                  <div className="space-y-4">
                    <div className="border-b pb-2 mb-2">
                      <h2 className="text-sm font-black text-stone-850">Giá bán</h2>
                      <p className="text-[10.5px] text-stone-400 font-medium mt-1">Cấu hình giá cả giao dịch khóa học.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Giá bán gốc (VND) *</label>
                        <input 
                          type="number" 
                          value={price}
                          onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full text-[11px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none bg-slate-50/10 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Giá khuyến mãi (VND)</label>
                        <input 
                          type="number" 
                          value={salePrice || ''}
                          onChange={(e) => setSalePrice(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full text-[11px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none bg-slate-50/10 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Price Preview */}
                    <div className="bg-[#e6f4ea]/40 border border-emerald-100/60 rounded-xl p-3.5 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="text-stone-500 block font-bold text-[10px]">Thực tế thanh toán:</span>
                        <span className="text-sm font-black text-emerald-600 font-sans">
                          {formatVND(salePrice !== null && salePrice > 0 && salePrice <= price ? salePrice : price)}
                        </span>
                      </div>
                      {salePrice !== null && salePrice > price && (
                        <div className="text-rose-500 font-bold bg-rose-50 border border-rose-100 rounded-xl px-3 py-1.5 text-[9.5px]">
                          Giá khuyến mãi không được vượt quá giá gốc!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Images & Intro Video */}
                {builderStep === 4 && (
                  <CourseMediaStep 
                    image={image}
                    setImage={setImage}
                    introVideoUrl={introVideoUrl}
                    setIntroVideoUrl={setIntroVideoUrl}
                  />
                )}

                {/* Step 5: Syllabus & Submit */}
                {builderStep === 5 && (
                  <CourseCurriculumStep 
                    chapters={chapters}
                    setChapters={setChapters}
                    checklistProgress={checklistProgress}
                    missingItems={missingItems}
                    completedItems={completedItems}
                    onSubmitForReview={handleFinishCoursePublish}
                  />
                )}

              </div>

              {/* Navigation buttons */}
              {builderStep < 5 && (
                <div className="flex justify-between pt-4 border-t select-none">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={builderStep === 1}
                    className="border border-slate-200 text-stone-600 bg-white hover:bg-slate-50 font-bold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
                  >
                    Quay lại
                  </button>

                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={handleSaveDraft}
                      className="border border-[#10b981] text-[#10b981] hover:bg-emerald-50 px-4 py-2 rounded-xl font-bold cursor-pointer"
                    >
                      Lưu nháp
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#10b981] hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl flex items-center gap-1 cursor-pointer select-none"
                    >
                      Tiếp theo &rarr;
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })()}
        {/* ASSIGNMENTS SUBMISSION GRADING WORKFLOW */}
        {activeTab === 'grading' && (
          <div className="space-y-6 animate-fade-in text-xs text-left">
            <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1">
              <Clock className="w-4 h-4 text-stone-850" /> Chấm Bài làm học viên
            </h3>

            <div className="space-y-3">
              {gradingSubmissions.map(submission => (
                <div key={submission.id} className="border border-brand-light-active p-4 rounded-2xl bg-slate-50 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <span className="font-bold text-main-darker block">{submission.studentName}</span>
                      <span className="text-[10px] text-gray-400">{submission.email} • {submission.courseTitle}</span>
                    </div>
                    {submission.points ? (
                      <span className="bg-emerald-100 text-emerald-850 font-bold px-3 py-1 rounded">Điểm: {submission.points}/100</span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded">Chưa chấm điểm</span>
                    )}
                  </div>

                  <div className="bg-white border p-3 rounded-xl">
                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Mã nộp bài giải:</p>
                    <p className="font-mono text-[11px] text-emerald-600 break-all">{submission.submittedValue}</p>
                  </div>

                  {submission.points === null ? (
                    <div className="space-y-2">
                      <div className="flex gap-2.5">
                        <input 
                          type="number" 
                          placeholder="Chấm điểm (0 - 100)" 
                          id={`score-val-${submission.id}`}
                          className="w-32 text-xs border border-brand-light-active pl-3 py-1.5 rounded-xl bg-white" 
                        />
                        <button 
                          onClick={() => {
                            const val = parseInt((document.getElementById(`score-val-${submission.id}`) as HTMLInputElement)?.value || '95');
                            handleGradeSubmission(submission.id, val, 'Lời giải của bạn chính xác, code tối ưu dữ liệu!');
                          }}
                          className="bg-brand-normal text-white text-[11px] font-bold px-5 py-1.5 rounded-xl hover:bg-brand-hover"
                        >
                          Xác nhận Điểm & Gửi phản hồi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500 italic"><b>Nhận xét:</b> {submission.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        
        

        
        {/* WITHDRAWAL TAB */}
        {activeTab === 'payout' && (
          <InstructorWithdrawal instructorId={currentUser?.id} />
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <TransactionManagement instructorId={currentUser?.id || ''} />
        )}

        {/* STUDENTS MANAGEMENT DASHBOARD */}
        {activeTab === 'students' && (
          <StudentManagement instructorCourses={instructorCourses} />
        )}

        {/* TAB 7: SECURITY */}
        {activeTab === 'security' && (
          <InstructorProfilePage currentUser={currentUser} />
        )}

        

        {/* TAB 9: COUPONS */}
        {activeTab === 'coupons' && (
          <CouponManagement />
        )}

        {/* TAB 10: QA */}
        {activeTab === 'qa' && (
          <InstructorQAModule />
        )}

      </div>
    </main>
  </div>
</div>
  );
}
