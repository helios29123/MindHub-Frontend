import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, Shield, AlertTriangle, MessageSquare, 
  Trash2, UserX, Compass, Eye, ShieldAlert, Award, BookOpen, Clock, FileText, Info
} from 'lucide-react';
import { Course, FlaggedItem, User, AccountRequest } from '../types';

interface ModeratorTabProps {
  currentUser: User;
  courses: Course[];
  flaggedReviews: FlaggedItem[];
  onApproveCourse: (courseId: string) => void;
  onRejectCourse: (courseId: string, reason: string) => void;
  onResolveFlag: (flagId: string, resolveAction: 'dismiss' | 'resolved') => void;
  accountRequests: AccountRequest[];
  onResolveAccountRequest: (id: string, action: 'approved' | 'rejected') => void;
  onClose: () => void;
}

export default function ModeratorTab({
  currentUser,
  courses,
  flaggedReviews,
  onApproveCourse,
  onRejectCourse,
  onResolveFlag,
  accountRequests,
  onResolveAccountRequest,
  onClose
}: ModeratorTabProps) {

  // Selected tab: 'moderation_courses' | 'moderation_content' | 'account_requests'
  const [activeTab, setActiveTab] = useState<'moderation_courses' | 'moderation_content' | 'account_requests'>('moderation_courses');
  
  // Rejection modal state
  const [rejectingCourseId, setRejectingCourseId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  
  // Course detailed inspector state
  const [inspectingCourse, setInspectingCourse] = useState<Course | null>(null);

  // Search & Filter for Pending Courses
  const [courseSearchQuery, setCourseSearchQuery] = useState('');

  // Search & Filter for Flagged Content (Comments/Reviews)
  const [contentSearchQuery, setContentSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'review' | 'comment'>('all');

  // Course review actions
  const pendingCourses = courses.filter(c => {
    const matchesQuery = c.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                         c.instructorName.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                         c.description.toLowerCase().includes(courseSearchQuery.toLowerCase());
    return c.status === 'pending' && matchesQuery;
  });

  const handleOpenRejectModal = (courseId: string) => {
    setRejectingCourseId(courseId);
    setRejectionReasonText('');
  };

  const handleConfirmReject = () => {
    if (!rejectingCourseId || !rejectionReasonText.trim()) return;
    onRejectCourse(rejectingCourseId, rejectionReasonText);
    setRejectingCourseId(null);
    setRejectionReasonText('');
    alert('Đã ghi nhận lý do và từ chối phê duyệt khóa học này thành công!');
  };

  return (
    <div className="bg-white min-h-[85vh] rounded-2xl border border-brand-light-active overflow-hidden flex flex-col md:flex-row text-main-darker animate-fade-in shadow">
      
      {/* Tab Selectors Left Sidebar */}
      <div className="w-full md:w-56 bg-brand-light border-b md:border-b-0 md:border-r border-brand-light-active p-4 space-y-2 shrink-0">
        <div className="text-center pb-4 border-b border-brand-light-active mb-4">
          <img src={currentUser.avatar} alt="Avatar" className="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-brand-dark" />
          <h3 className="text-xs font-bold truncate">{currentUser.name}</h3>
          <span className="text-[9px] bg-main-normal text-brand-light uppercase tracking-wider px-2 py-0.5 rounded inline-block mt-1 font-semibold">Moderator Team</span>
        </div>

        <button 
          onClick={() => setActiveTab('moderation_courses')}
          className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 ${activeTab === 'moderation_courses' ? 'bg-brand-normal text-brand-light' : 'hover:bg-brand-light-hover'}`}
        >
          <Compass className="w-4 h-4 text-stone-700" /> Khóa học Chờ Duyệt ({courses.filter(c => c.status === 'pending').length})
        </button>
        <button 
          onClick={() => setActiveTab('moderation_content')}
          className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 ${activeTab === 'moderation_content' ? 'bg-brand-normal text-brand-light' : 'hover:bg-brand-light-hover'}`}
        >
          <ShieldAlert className="w-4 h-4 text-stone-700" /> Kiểm duyệt Bình luận/Đánh giá ({flaggedReviews.length})
        </button>
        <button 
          onClick={() => setActiveTab('account_requests')}
          className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between ${activeTab === 'account_requests' ? 'bg-brand-normal text-brand-light' : 'hover:bg-brand-light-hover'}`}
        >
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4 text-stone-705 shrink-0" /> Yêu cầu Khóa & Xóa
          </div>
          <span className="bg-red-150 text-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {accountRequests.filter(r => r.status === 'pending').length}
          </span>
        </button>

        <div className="pt-6">
          <button onClick={onClose} className="w-full text-center border text-xs py-1.5 rounded-lg text-gray-400 hover:text-black">
            Về Trang Chủ
          </button>
        </div>
      </div>

      {/* Interactive Main Body Content */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        
        {/* COURSES VERIFICATION/APPROVE WORKFLOW */}
        {activeTab === 'moderation_courses' && (() => {
          const totalPendingCount = courses.filter(c => c.status === 'pending').length;

          return (
            <div className="space-y-4 animate-fade-in text-xs text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-stone-100">
                <div>
                  <h3 className="text-base font-display font-bold text-main-normal text-left flex items-center gap-1.5">
                    <Compass className="w-5 h-5 text-stone-800" /> Danh sách khóa học chờ thẩm định xuất bản
                  </h3>
                  <p className="text-[10.5px] text-stone-400">Kiểm tra thông tin đề cương, tài liệu và cấu trúc lớp học trước khi xuất bản rộng rãi.</p>
                </div>
                
                {/* Search query input */}
                {totalPendingCount > 0 && (
                  <div className="w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Tìm bài giảng theo từ khóa, giảng viên..."
                      value={courseSearchQuery}
                      onChange={(e) => setCourseSearchQuery(e.target.value)}
                      className="w-full text-xs p-2 px-3 border border-brand-light-active rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-normal placeholder-stone-400 font-medium"
                    />
                  </div>
                )}
              </div>
              
              {totalPendingCount === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-dashed rounded-2xl">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                  <p className="font-extrabold text-sm text-stone-800">Xin chúc mừng!</p>
                  <p className="text-stone-500 text-xs mt-1">Không có chương trình đào tạo nào đang tồn đọng chờ kiểm duyệt xuất bản.</p>
                </div>
              ) : pendingCourses.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-dashed rounded-2xl space-y-2">
                  <Info className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="text-stone-500 font-bold">Không tìm thấy kết quả nào phù hợp với từ khóa "{courseSearchQuery}".</p>
                  <button
                    onClick={() => setCourseSearchQuery('')}
                    className="text-[#8b5e3c] font-black hover:underline text-xs"
                  >
                    Xóa bộ lọc tìm kiếm
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingCourses.map((c) => (
                    <div key={c.id} className="border border-brand-light-active bg-slate-50 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:border-brand-normal/30 transition-all">
                      <div className="flex gap-3 text-left">
                        <img src={c.image} alt="Banner" className="w-20 h-14 object-cover rounded-lg shrink-0 border" />
                        <div>
                          <span className="text-[9px] bg-brand-normal/10 text-brand-dark px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{c.category}</span>
                          <h4 className="font-bold text-xs text-main-normal leading-snug mt-1">{c.title}</h4>
                          <p className="text-[10px] text-stone-500 mt-0.5">Giảng viên: <span className="font-semibold text-stone-700">{c.instructorName}</span> • Đề xuất: <span className="font-bold text-stone-800">{c.price.toLocaleString('vi-VN')} VND</span></p>
                          <p className="text-[11px] text-stone-605 mt-1 line-clamp-2">{c.description}</p>
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0 w-full md:w-auto self-end md:self-center justify-end">
                        <button 
                          onClick={() => setInspectingCourse(c)}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-850 font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 border border-stone-300 shadow-3xs text-[11px]"
                          title="Xem toàn bộ cấu trúc bài viết, tài liệu, quiz"
                        >
                          <Eye className="w-3.5 h-3.5 text-stone-750" /> Xem Chi Tiết
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Xác nhận phê duyệt và phát hành khóa học "${c.title}" lên hệ thống MindHub công khai?`)) {
                              onApproveCourse(c.id);
                              alert('✓ Đã phê duyệt và xuất bản khóa học thành công!');
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 shadow text-[11px]"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Phê Duyệt
                        </button>
                        <button 
                          onClick={() => handleOpenRejectModal(c.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 shadow text-[11px]"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Từ Chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* FLAGGED CONCERNS COMMENT / REVIEWS BLACKLIST VERIFY */}
        {activeTab === 'moderation_content' && (() => {
          const totalFlagsCount = flaggedReviews.length;
          
          const filteredFlagged = flaggedReviews.filter(flag => {
            const matchesSearch = flag.content.toLowerCase().includes(contentSearchQuery.toLowerCase()) ||
                                  flag.reporter.toLowerCase().includes(contentSearchQuery.toLowerCase()) ||
                                  flag.reason.toLowerCase().includes(contentSearchQuery.toLowerCase()) ||
                                  (flag.courseTitle || '').toLowerCase().includes(contentSearchQuery.toLowerCase());
            const matchesType = contentTypeFilter === 'all' || flag.type === contentTypeFilter;
            return matchesSearch && matchesType;
          });

          return (
            <div className="space-y-4 animate-fade-in text-xs text-left">
              <div className="border-b pb-4 space-y-2">
                <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5">
                  <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" /> 
                  Kiểm duyệt nội dung Bình luận & Đánh giá học viên
                </h3>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Xem xét các báo cáo vi phạm tiêu chuẩn cộng đồng, từ ngữ thô tục, spam liên kết lậu, hoặc nội dung không hợp lệ do các thành viên đóng góp.
                </p>
              </div>

              {totalFlagsCount > 0 && (
                <div className="flex flex-col md:flex-row gap-3 bg-slate-50 p-3 rounded-2xl border">
                  
                  {/* Search query field */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Tìm nội dung vi phạm, người báo cáo..."
                      value={contentSearchQuery}
                      onChange={(e) => setContentSearchQuery(e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-light-active rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-brand-normal placeholder-stone-400 font-medium"
                    />
                  </div>

                  {/* Filter tabs */}
                  <div className="flex gap-1 bg-stone-200/50 p-1 rounded-xl self-start md:self-center">
                    <button
                      type="button"
                      onClick={() => setContentTypeFilter('all')}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                        contentTypeFilter === 'all' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-855'
                      }`}
                    >
                      Tất cả ({flaggedReviews.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentTypeFilter('review')}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                        contentTypeFilter === 'review' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-855'
                      }`}
                    >
                      Đánh giá (Review)
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentTypeFilter('comment')}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                        contentTypeFilter === 'comment' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-855'
                      }`}
                    >
                      Bình luận (Q&A)
                    </button>
                  </div>

                </div>
              )}

              {totalFlagsCount === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-dashed rounded-2xl">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                  <p className="font-extrabold text-sm text-stone-800">Không có tố cáo vi phạm!</p>
                  <p className="text-stone-500 text-xs mt-1">Hệ thống bình luận, đánh giá hiện đang hoạt động lành mạnh và an tâm.</p>
                </div>
              ) : filteredFlagged.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-dashed rounded-2xl space-y-2">
                  <Info className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="text-stone-500 font-semibold text-xs">Không tìm thấy nội dung vi phạm nào khớp với bộ lọc.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setContentSearchQuery('');
                      setContentTypeFilter('all');
                    }}
                    className="text-[#8b5e3c] font-black hover:underline text-[11px]"
                  >
                    Xóa tất cả bộ lọc hiện hữu
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFlagged.map((flag) => (
                    <div key={flag.id} className="border border-red-150 bg-red-50/5 hover:bg-neutral-50/50 p-4 rounded-2xl space-y-3 text-left transition-all relative">
                      
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="font-extrabold text-red-650 flex items-center gap-1 font-sans">
                          <AlertTriangle className="w-4 h-4 text-red-650 animate-pulse shrink-0" />
                          Lý do báo cáo: <span className="underline decoration-red-200">{flag.reason}</span>
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded uppercase ${
                            flag.type === 'review' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {flag.type === 'review' ? '⭐ Đánh giá' : '💬 Thảo luận Q&A'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">Người báo cáo: {flag.reporter}</span>
                        </div>
                      </div>

                      {flag.courseTitle && (
                        <div className="bg-stone-105 hover:bg-stone-200 px-2.5 py-1 rounded-lg text-[10.5px] text-stone-850 flex items-center gap-1 inline-block border font-bold">
                          <BookOpen className="w-3.5 h-3.5 text-stone-700" />
                          <span>Mục tiêu tại:</span> <span className="font-extrabold text-stone-900">{flag.courseTitle}</span>
                        </div>
                      )}

                      <div className="bg-white p-3 rounded-lg border border-red-100/60 text-stone-750 leading-normal text-xs font-semibold whitespace-pre-wrap font-mono italic">
                        "{flag.content}"
                      </div>

                      <div className="flex justify-end gap-2 text-xs pt-1">
                        {/* Dismiss report */}
                        <button 
                          onClick={() => {
                            if (window.confirm('Bác bỏ báo cáo và hiển thị lại bình luận này bình thường?')) {
                              onResolveFlag(flag.id, 'dismiss');
                              alert('✓ Đã bác bỏ báo cáo. Bình luận này an toàn.');
                            }
                          }}
                          className="border border-stone-300 hover:bg-white text-stone-600 font-bold px-3 py-1.5 rounded-xl text-xs bg-slate-50 transition-all shadow-3xs"
                        >
                          Bác bỏ tố cáo (Nội dung Sạch)
                        </button>
                        
                        {/* Logically delete from course’s reviews list & remove flag */}
                        <button 
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn XÓA BỎ VĨNH VIỄN bình luận/đánh giá vi phạm này khỏi hệ thống khóa học?')) {
                              onResolveFlag(flag.id, 'resolved');
                              alert('✓ Nội dung vi phạm đã được gỡ bỏ khỏi cơ sở dữ liệu học trình thành công!');
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all whitespace-nowrap"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Gỡ bỏ Nội dung (Xóa vĩnh viễn)
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ACCOUNT LOCK/DELETION REQUESTS FOR MODERATORS */}
        {activeTab === 'account_requests' && (
          <div className="space-y-4 animate-fade-in text-xs text-left">
            <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5">
              <UserX className="w-5 h-5 text-red-650" />
              Kiểm duyệt yêu cầu Khóa & Xóa (Moderator Panel)
            </h3>
            <p className="text-gray-400 text-xs">
              Xem xét đề xuất đóng/xóa dữ liệu và vô hiệu hóa tài khoản tự nguyện được gửi từ học viên.
            </p>

            {accountRequests.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-2xl bg-slate-50">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-xs text-main-normal">Không có yêu cầu Khóa/Xóa tài khoản nào cần xử lý.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {accountRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className={`border p-4 rounded-xl bg-white shadow-3xs flex flex-col md:flex-row justify-between gap-4 items-start md:items-center transition-all ${
                      req.status === 'approved' ? 'border-emerald-200/60 bg-emerald-50/10' :
                      req.status === 'rejected' ? 'border-stone-205 bg-stone-50/20' : 'border-red-150 bg-red-50/5'
                    }`}
                  >
                    <div className="space-y-2 flex-1 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-main-normal">{req.userName}</span>
                        <span className="text-stone-400 font-mono">({req.userEmail})</span>
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded tracking-wider ${
                          req.type === 'delete' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.type === 'delete' ? '🚨 Đóng vĩnh viễn' : '⏳ Tạm khóa tài khoản'}
                        </span>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-850' :
                          req.status === 'rejected' ? 'bg-stone-200 text-stone-605' : 'bg-red-100 text-red-600 border border-red-200'
                        }`}>
                          {req.status === 'approved' ? 'Kiểm duyệt viên đã Duyệt' :
                           req.status === 'rejected' ? 'Kiểm duyệt viên từ chối' : 'Đang Đợi Duyệt'}
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-600 bg-slate-50 p-2.5 rounded-xl border border-stone-100/60">
                        <span className="font-bold text-stone-700 block mb-0.5">Lý do trình báo:</span>
                        <p className="italic font-sans leading-relaxed">"{req.reason}"</p>
                      </div>

                      <div className="text-[9px] text-gray-400 font-mono">
                        Yêu cầu tự nguyện gửi lúc: {new Date(req.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex gap-1.5 self-end md:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onResolveAccountRequest(req.id, 'approved');
                            alert(`Đã duyệt chấp thuận yêu cầu của ${req.userName}.`);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 shadow transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Duyệt đóng
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onResolveAccountRequest(req.id, 'rejected');
                            alert(`Đã từ chối yêu cầu của ${req.userName}.`);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 shadow transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Từ Chối
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODERATOR COURSE INSPECTION MODAL */}
        {inspectingCourse && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 text-left border shadow-2xl max-h-[92vh] overflow-y-auto tactile-scrollbar">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <span className="text-[9px] bg-stone-900 text-white px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                    {inspectingCourse.category} • NHÁP CHỜ KIỂM DUYỆT
                  </span>
                  <h3 className="font-display font-bold text-main-normal text-base mt-1">{inspectingCourse.title}</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">Giảng viên xuất bản: <span className="font-bold">{inspectingCourse.instructorName}</span> • Giá dự kiến: {inspectingCourse.price.toLocaleString('vi-VN')} VND</p>
                </div>
                <button 
                  onClick={() => setInspectingCourse(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-stone-500 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs text-stone-800">
                
                {/* Descriptive image & requirements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <img src={inspectingCourse.image} alt="Banner Preview" className="w-full h-32 object-cover rounded-xl border" />
                    <p className="text-[11px] text-stone-500 italic mt-1.5">{inspectingCourse.subtitle}</p>
                  </div>
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border">
                    <h4 className="font-bold text-stone-900 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-stone-700" /> Tiêu chuẩn khóa học
                    </h4>
                    <p className="font-semibold text-[10.5px]">Điều kiện tiên quyết:</p>
                    <ul className="list-disc pl-4 space-y-1 text-[10px] text-stone-600">
                      {inspectingCourse.requirements?.map((req, i) => (
                        <li key={i}>{req}</li>
                      )) || <li>Không yêu cầu gì đặc biệt.</li>}
                    </ul>
                    <p className="font-semibold text-[10.5px] mt-2">Năng lực đạt được sau học trình:</p>
                    <ul className="list-disc pl-4 space-y-1 text-[10px] text-stone-600">
                      {inspectingCourse.willLearn?.map((learn, i) => (
                        <li key={i}>{learn}</li>
                      )) || <li>Hoàn thiện kỹ năng của ngành.</li>}
                    </ul>
                  </div>
                </div>

                {/* Chapters list verification */}
                <div className="space-y-2 border-t pt-3">
                  <h4 className="font-bold text-stone-950 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-stone-700" /> Hệ thống chương học & Nội dung giảng dạy đính kèm
                  </h4>

                  {inspectingCourse.chapters && inspectingCourse.chapters.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {inspectingCourse.chapters.map((ch, idx) => (
                        <div key={ch.id || idx} className="bg-stone-50 p-2.5 rounded-lg border text-left">
                          <p className="font-bold text-stone-900">Chương {idx + 1}: {ch.title}</p>
                          <div className="pl-3 mt-1 space-y-1.5 border-l-2 border-stone-300">
                            {ch.lessons?.map((les, lidx) => (
                              <div key={les.id || lidx} className="text-[11px] space-y-1">
                                <p className="text-stone-700 font-medium">✔️ {les.title} ({les.duration || '0:00'})</p>
                                
                                {les.docContent && (
                                  <div className="bg-white p-2 rounded border border-stone-200 mt-1 max-h-24 overflow-y-auto text-[10px] font-mono leading-relaxed whitespace-pre-wrap text-stone-600">
                                    📄 <b>[NỘI DUNG TÀI LIỆU DOC]:</b>
                                    <br />
                                    {les.docContent}
                                  </div>
                                )}

                                {les.quiz && les.quiz.length > 0 && (
                                  <div className="bg-[#f0f9ff] text-[#0369a1] p-1.5 rounded border border-[#b3e5fc] text-[9.5px] font-medium leading-relaxed">
                                    📝 <b>Có bài tập trắc nghiệm ({les.quiz.length} câu)</b>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl leading-relaxed text-[11px] font-medium border border-red-200">
                      ⚠️ Giảng viên chưa đăng tải nội dung cụ thể hoặc hệ thống bài học nào cho khóa học nháp này! Cần có tối thiểu 1 chương học và bài tập để tiếp cận kiểm duyệt.
                    </div>
                  )}
                </div>

                {/* Additional specific user/course permissions verification */}
                <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 space-y-1">
                  <h4 className="font-bold text-[#854d0e] flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-[#854d0e]" /> Thiết lập bảo mật quy tắc học viên:
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-[10.5px] text-stone-700">
                    <li>Cho phép tua bài giảng: {inspectingCourse.allowSkip ? 'Đồng ý' : 'Không (Bắt buộc xem hết)'}</li>
                    <li>Cho phép tải code/tài liệu: {inspectingCourse.allowDownload ? 'Đồng ý' : 'Không (Chỉ đọc online)'}</li>
                    <li>Mở cổng thảo luận Q&A: {inspectingCourse.allowDiscussion !== false ? 'Mở' : 'Khóa đóng'}</li>
                    <li>Cấp chứng chỉ: {inspectingCourse.giveCertificate ? 'Có' : 'Không'}</li>
                  </ul>
                </div>

              </div>

              <div className="flex justify-end gap-2 text-xs pt-3 border-t">
                <button 
                  onClick={() => setInspectingCourse(null)}
                  className="px-4 py-2 border rounded-xl bg-slate-50 text-stone-600 hover:text-black font-semibold"
                >
                  Đóng cửa sổ
                </button>
                <button 
                  onClick={() => {
                    const id = inspectingCourse.id;
                    setInspectingCourse(null);
                    onApproveCourse(id);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Phê Duyệt Ngay ✔️
                </button>
                <button 
                  onClick={() => {
                    const id = inspectingCourse.id;
                    setInspectingCourse(null);
                    handleOpenRejectModal(id);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                >
                  Từ Chối Hoàn Trả
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REJECTION REASON DETAIL MODAL SIMULATION */}
        {rejectingCourseId && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 text-left border shadow-2xl">
              <h3 className="font-display font-semibold text-main-normal text-sm flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" /> Nhập Lý Do Từ Chối Phê Duyệt
              </h3>
              <p className="text-xs text-stone-500 leading-snug">Lý do này sẽ hiển thị trực tiếp trong Hồ Sơ của Giảng viên để họ chỉnh sửa đề cương kịp thời.</p>
              
              <textarea 
                rows={4}
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                placeholder="Bài giảng thử nghiệm còn thiếu chapter 2, âm thanh video bị rè, hoặc có nội dung vi phạm bản quyền..."
                className="w-full text-xs p-3 border rounded-xl focus:ring-1 focus:ring-brand-normal focus:outline-none"
                required
              />

              <div className="flex justify-end gap-2 text-xs">
                <button 
                  onClick={() => setRejectingCourseId(null)}
                  className="px-4 py-2 border rounded-xl text-stone-600 bg-slate-50 hover:bg-white font-medium"
                >
                  Bỏ qua
                </button>
                <button 
                  onClick={handleConfirmReject}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                >
                  Xác nhận Từ Chối xuất bản
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
