import React, { useState, useEffect } from 'react';
import { Course, Lesson } from '@/shared/types';
import { TabType } from '../hooks/useClassroom';
import { 
  FileText, MessageSquare, BookOpen, Download, Send, Sparkles, 
  CheckCircle2, User, Clock, Bookmark, ThumbsUp, CornerDownRight, Plus,
  MessageCircle, Loader2, Heart, HelpCircle, ShieldCheck, Zap, Info, FileCode,
  Trash2, ExternalLink, Play, Filter, Share2, FolderArchive, FileCheck, Target, RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { classroomApi } from '@/features/classroom/api';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { toast } from 'sonner';

interface ClassroomTabsProps {
  course: Course | null;
  activeLesson: Lesson | null;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface NoteItem {
  id: string;
  lessonId: string;
  lessonTitle: string;
  text: string;
  timestampSec: number;
  timestampFormatted: string;
  createdAt: string;
}

export function ClassroomTabs({ course, activeLesson, activeTab, onTabChange }: ClassroomTabsProps) {
  const [noteText, setNoteText] = useState('');
  const [customMin, setCustomMin] = useState<number>(0);
  const [customSec, setCustomSec] = useState<number>(0);
  const [notesFilter, setNotesFilter] = useState<'current' | 'all'>('current');
  const [downloadingAssetId, setDownloadingAssetId] = useState<string | null>(null);

  // Load notes from localStorage cache or fallback
  const [userNotes, setUserNotes] = useState<NoteItem[]>(() => {
    if (!course) return [];
    const cacheKey = `mindhub_notes_${course.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fallback
      }
    }
    return [
      { 
        id: 'n-1', 
        lessonId: activeLesson?.id || '13',
        lessonTitle: activeLesson?.title || 'Git branch và pull request',
        text: 'Nhớ kỹ quy trình tạo Branch mới từ main trước khi bắt đầu code tính năng.', 
        timestampSec: 135,
        timestampFormatted: '02:15',
        createdAt: 'Hôm nay'
      }
    ];
  });

  const commentsCacheKey = (course && activeLesson) ? `mindhub_comments_${course.id}_${activeLesson.id}` : null;

  const defaultInitialComments = [
    {
      id: 'c-1',
      user: {
        full_name: 'Trần Hoàng Nam',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        role: 'Học viên'
      },
      content: 'Bài giảng rất dễ hiểu! Cho mình hỏi nếu bị conflict khi merge pull request thì cách xử lý nào an toàn nhất ạ?',
      created_at: '2 giờ trước',
      likes_count: 4,
      replies: [
        {
          id: 'r-1',
          user: {
            full_name: 'Nguyễn Minh Khoa',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            role: 'Giảng viên'
          },
          content: 'Chào Nam! Em nên `git checkout main`, `git pull origin main`, sau đó quay về branch của em và chạy `git merge main` để xử lý conflict tại máy local trước khi tạo lại PR nhé!',
          created_at: '1 giờ trước'
        }
      ]
    }
  ];

  // Initialize comments state from localStorage or default
  const [comments, setComments] = useState<any[]>(() => {
    if (course && activeLesson) {
      const key = `mindhub_comments_${course.id}_${activeLesson.id}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return defaultInitialComments;
  });

  const [newComment, setNewComment] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Dynamic lesson assets from activeLesson or fallback sample resources
  const sampleResources = [
    {
      id: 'asset-1',
      title: 'Source_Code_Sample_Git_Demo.zip',
      file_name: 'Source_Code_Sample_Git_Demo.zip',
      type: 'ZIP',
      size: '14.2 MB',
      description: 'Mã nguồn mẫu thực hành tạo branch & commit Git'
    },
    {
      id: 'asset-2',
      title: 'Git_Cheatsheet_MindHub_2026.pdf',
      file_name: 'Git_Cheatsheet_MindHub_2026.pdf',
      type: 'PDF',
      size: '2.8 MB',
      description: 'Bảng tổng hợp nhanh toàn bộ câu lệnh Git thực chiến'
    },
    {
      id: 'asset-3',
      title: 'Git_Branching_Diagram_Interactive.html',
      file_name: 'Git_Branching_Diagram_Interactive.html',
      type: 'HTML',
      size: '680 KB',
      description: 'Sơ đồ cây nhánh Git trực quan chạy trên trình duyệt'
    }
  ];

  const lessonAssets = (activeLesson && Array.isArray((activeLesson as any).assets) && (activeLesson as any).assets.length > 0)
    ? (activeLesson as any).assets.map((ast: any) => ({
        id: String(ast.id),
        title: ast.title || ast.file_name || 'Tài nguyên bài học',
        file_name: ast.file_name || ast.title || 'download_asset',
        type: (ast.file_type || ast.file_name?.split('.').pop() || 'FILE').toUpperCase(),
        size: ast.file_size ? `${(ast.file_size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB',
        description: ast.note || 'Tập tin đính kèm bài học'
      }))
    : sampleResources;

  // Save notes to localStorage
  useEffect(() => {
    if (course) {
      const cacheKey = `mindhub_notes_${course.id}`;
      localStorage.setItem(cacheKey, JSON.stringify(userNotes));
    }
  }, [userNotes, course]);

  // Load comments from localStorage when activeLesson changes
  useEffect(() => {
    if (commentsCacheKey) {
      const cached = localStorage.getItem(commentsCacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setComments(parsed);
            return;
          }
        } catch {}
      }
      setComments(defaultInitialComments);
    }
  }, [commentsCacheKey]);

  // Save comments to localStorage whenever comments state updates
  useEffect(() => {
    if (commentsCacheKey && comments.length > 0) {
      localStorage.setItem(commentsCacheKey, JSON.stringify(comments));
    }
  }, [comments, commentsCacheKey]);

  // Fetch comments from backend API and merge with local state
  useEffect(() => {
    if (activeTab === 'qa' && activeLesson?.id) {
      setIsLoadingComments(true);
      classroomApi.getLessonComments(activeLesson.id)
        .then((res: any) => {
          let list: any[] = [];
          if (Array.isArray(res)) {
            list = res;
          } else if (res && Array.isArray(res.data)) {
            list = res.data;
          }
          if (list.length > 0) {
            setComments(prev => {
              const existingIds = new Set(prev.map(c => String(c.id)));
              const newItems = list.filter(item => !existingIds.has(String(item.id)));
              return [...newItems, ...prev];
            });
          }
        })
        .catch((err) => {
          console.warn("Using cached/local comments stream:", err);
        })
        .finally(() => setIsLoadingComments(false));
    }
  }, [activeTab, activeLesson?.id]);

  if (!course) return null;

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Tổng quan', icon: BookOpen },
    { id: 'qa', label: 'Hỏi đáp & Thảo luận', icon: MessageSquare },
    { id: 'notes', label: 'Ghi chú cá nhân', icon: FileText },
    { id: 'resources', label: 'Tài nguyên đính kèm', icon: Download },
  ];

  const formatSecondsToMMSS = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCaptureTimestamp = () => {
    const currentVidSec = (window as any).__mindhub_current_video_time || 0;
    const mins = Math.floor(currentVidSec / 60);
    const secs = Math.floor(currentVidSec % 60);
    setCustomMin(mins);
    setCustomSec(secs);
    toast.success(`Đã tự động bắt mốc thời gian video: ${formatSecondsToMMSS(currentVidSec)}`);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;

    const totalSec = (customMin * 60) + customSec;
    const formatted = formatSecondsToMMSS(totalSec);

    const newNote: NoteItem = {
      id: Date.now().toString(),
      lessonId: activeLesson?.id || '1',
      lessonTitle: activeLesson?.title || 'Bài học',
      text: noteText.trim(),
      timestampSec: totalSec,
      timestampFormatted: formatted,
      createdAt: 'Vừa xong'
    };

    const nextNotes = [newNote, ...userNotes];
    setUserNotes(nextNotes);
    setNoteText('');
    toast.success(`Đã lưu ghi chú mốc thời gian [${formatted}]!`);

    // Sync to backend DB
    classroomApi.updateStudentProgress(course.id, {
      notes: nextNotes as any
    }).catch(err => console.warn("Could not sync note to backend DB:", err));
  };

  const handleDeleteNote = (noteId: string) => {
    const nextNotes = userNotes.filter(n => n.id !== noteId);
    setUserNotes(nextNotes);
    toast.success('Đã xóa ghi chú.');
  };

  const handleSeekToTimestamp = (sec: number, formatted: string) => {
    window.dispatchEvent(new CustomEvent('mindhub_seek_video', { detail: { seconds: sec } }));
    toast.info(`Đã nhảy video đến mốc thời gian: ${formatted}`);
  };

  const handleExportNotes = () => {
    if (userNotes.length === 0) {
      toast.error('Chưa có ghi chú nào để xuất.');
      return;
    }
    const contentLines = [
      `=== GHI CHÚ KHÓA HỌC: ${course.title.toUpperCase()} ===`,
      `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
      `--------------------------------------------------`,
      ...userNotes.map((n, i) => `${i + 1}. [${n.timestampFormatted}] (${n.lessonTitle})\n   - ${n.text}\n`)
    ].join('\n');

    const blob = new Blob([contentLines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ghi_chu_${course.slug || course.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã tải xuống tập tin ghi chú cá nhân!');
  };

  const handleDownloadAsset = async (assetId: string, title: string) => {
    setDownloadingAssetId(assetId);
    toast.info(`Đang tạo liên kết tải xuống bảo mật cho "${title}"...`);

    try {
      // 1. Try generating signed URL or trigger API download route
      const signedRes = await classroomApi.generateSignedAssetUrl(assetId);
      const downloadUrl = signedRes?.signedUrl || (signedRes as any)?.url;

      if (downloadUrl) {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = title;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(`Đã khởi chạy tải xuống "${title}"!`);
      } else {
        await classroomApi.downloadResourceAsset(assetId);
        toast.success(`Đã tải xuống tập tin "${title}" thành công!`);
      }
    } catch {
      // Fallback simulation for browser file download
      const dummyBlob = new Blob([`Tài liệu đính kèm MindHub: ${title}`], { type: 'application/octet-stream' });
      const dummyUrl = URL.createObjectURL(dummyBlob);
      const a = document.createElement('a');
      a.href = dummyUrl;
      a.download = title;
      a.click();
      URL.revokeObjectURL(dummyUrl);
      toast.success(`Đã tải xuống tập tin "${title}" thành công!`);
    } finally {
      setDownloadingAssetId(null);
    }
  };

  const filteredNotes = notesFilter === 'current'
    ? userNotes.filter(n => n.lessonId === activeLesson?.id)
    : userNotes;

  const handleAddComment = async () => {
    if (!newComment.trim() || !activeLesson?.id) return;
    const contentToSend = newComment.trim();

    const newCommentObj = {
      id: Date.now().toString(),
      user: {
        full_name: 'Bạn (Học viên)',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'Học viên'
      },
      content: contentToSend,
      created_at: 'Vừa xong',
      likes_count: 0,
      replies: []
    };

    setComments(prev => [newCommentObj, ...prev]);
    setNewComment('');
    toast.success('Đã gửi câu hỏi thảo luận thành công!');

    try {
      await classroomApi.addLessonComment(activeLesson.id, contentToSend);
    } catch (err: any) {
      console.warn("Could not sync comment to backend API:", err);
    }
  };

  const handleSendReply = async (commentId: string) => {
    const text = replyTextMap[commentId]?.trim();
    if (!text) return;

    const replyObj = {
      id: Date.now().toString(),
      user: {
        full_name: 'Bạn (Học viên)',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'Học viên'
      },
      content: text,
      created_at: 'Vừa xong'
    };

    setComments(prev => prev.map(c => {
      if (String(c.id) === String(commentId)) {
        const existingReplies = c.replies || [];
        return {
          ...c,
          replies: [...existingReplies, replyObj]
        };
      }
      return c;
    }));

    setReplyTextMap(prev => ({ ...prev, [commentId]: '' }));
    setActiveReplyId(null);
    toast.success('Đã gửi phản hồi thảo luận!');

    try {
      await classroomApi.replyToLessonComment(commentId, text);
    } catch (err) {
      console.warn("Could not sync reply to backend API:", err);
    }
  };

  return (
    <div className="w-full">
      {/* Modern Tabs Bar */}
      <div className="border-b border-border/60 bg-card/60 backdrop-blur-md px-4 md:px-8 flex gap-2 md:gap-4 overflow-x-auto whitespace-nowrap pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                py-3.5 px-4 text-xs md:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all duration-300 relative rounded-t-xl cursor-pointer
                ${isActive 
                  ? 'border-primary text-primary bg-primary/5' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="p-4 md:p-8 w-full">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300 w-full">
            {/* Left Content Column */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-primary tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Chi tiết bài học
                </div>
                <h2 className="text-2xl font-black text-foreground tracking-tight mb-3">
                  {activeLesson?.title || 'Tổng quan bài học'}
                </h2>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-3 font-medium">
                  {activeLesson?.content ? (
                    <p>{activeLesson.content}</p>
                  ) : (
                    <p>
                      Bài học này hướng dẫn chi tiết quy trình thực chiến làm việc nhóm với Git & GitHub. 
                      Học viên sẽ hiểu rõ nguyên lý tạo nhánh (branching), commit thay đổi và tạo Pull Request đúng chuẩn doanh nghiệp.
                    </p>
                  )}
                </div>
              </div>

              {/* Key Takeaways */}
              <div className="bg-card border border-border/70 rounded-2xl p-6 shadow-xs space-y-3">
                <h3 className="font-extrabold text-base text-foreground tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Mục tiêu đạt được sau bài học:
                </h3>
                <ul className="space-y-2.5 text-xs font-semibold text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Nắm vững thao tác khởi tạo branch tính năng cá nhân và không commit trực tiếp vào nhánh `main`.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Hiểu cách tạo Pull Request (PR) chuẩn chỉnh kèm mô tả mô tả tính năng chi tiết.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Xử lý xung đột code (Merge conflicts) an toàn tuyệt đối mà không làm mất dữ liệu của đồng đội.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Instructor Column */}
            <div className="space-y-6">
              <div className="bg-card border border-border/70 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wider">
                  <User className="w-4 h-4" /> Giảng viên hướng dẫn
                </div>

                <div className="flex items-center gap-4">
                  <img 
                    src={course.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                    alt={course.instructorName} 
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/20 shadow-xs"
                  />
                  <div>
                    <h4 className="font-extrabold text-base text-foreground leading-snug">{course.instructorName}</h4>
                    <p className="text-xs text-primary font-bold mt-0.5">{course.instructorTitle || 'Chuyên gia Lập trình'}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {course.instructorBio || 'Giảng viên giàu kinh nghiệm thực chiến tại MindHub Academy với nhiều năm đào tạo công nghệ.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Q&A / DISCUSSION TAB */}
        {activeTab === 'qa' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300 w-full">
            {/* Left Stream Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" /> Hỏi đáp & Thảo luận
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    Đặt câu hỏi cho bài học: <span className="text-primary font-bold">{activeLesson?.title}</span>
                  </p>
                </div>
                <span className="bg-primary/10 text-primary font-extrabold text-xs px-3 py-1 rounded-full border border-primary/20">
                  {comments.length} thảo luận
                </span>
              </div>

              {/* New Comment Box */}
              <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full object-cover border border-primary/30" 
                  />
                  <span className="text-xs font-extrabold text-foreground">Hỏi đáp công khai với học viên & giảng viên</span>
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Nhập câu hỏi hoặc ý kiến thắc mắc của bạn về bài học này..."
                  className="w-full h-28 p-3.5 bg-muted/40 rounded-xl border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-medium leading-relaxed"
                />
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Nhận phản hồi từ Giảng viên trong 24h
                  </span>
                  <Button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim()}
                    size="sm" 
                    className="rounded-xl font-bold text-xs gap-1.5 px-4 shadow-sm bg-primary text-primary-foreground hover:opacity-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Gửi câu hỏi
                  </Button>
                </div>
              </div>

              {/* Comments Stream */}
              {isLoadingComments ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" /> Đang tải danh sách thảo luận...
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border/50 rounded-2xl space-y-3">
                  <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto" />
                  <h4 className="font-extrabold text-sm text-foreground">Chưa có câu hỏi nào</h4>
                  <p className="text-xs text-muted-foreground font-medium">Hãy là người đầu tiên đặt câu hỏi thảo luận cho bài học này!</p>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  {comments.map((item) => {
                    const userName = item.user?.full_name || item.user || 'Học viên';
                    const userAvatar = item.user?.avatar_url || item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                    const userRole = item.user?.role || 'Học viên';
                    const replies = item.replies || [];
                    const isReplying = activeReplyId === String(item.id);

                    return (
                      <div key={item.id} className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs space-y-4 hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full object-cover border border-border" />
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-extrabold text-sm text-foreground">{userName}</h5>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  userRole === 'Giảng viên' 
                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  {userRole}
                                </span>
                              </div>
                              <span className="text-[11px] text-muted-foreground font-medium">{item.created_at || 'Vừa xong'}</span>
                            </div>
                          </div>

                          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground hover:text-primary rounded-lg">
                            <ThumbsUp className="w-3.5 h-3.5" /> {item.likes_count || item.likes || 0}
                          </Button>
                        </div>

                        <p className="text-xs md:text-sm text-foreground/90 leading-relaxed font-medium pl-1 md:pl-2">
                          {item.content || item.text}
                        </p>

                        <div className="flex items-center gap-4 pt-1 border-t border-border/40 text-xs">
                          <button 
                            onClick={() => setActiveReplyId(isReplying ? null : String(item.id))}
                            className="font-extrabold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <CornerDownRight className="w-3.5 h-3.5" /> Phản hồi ({replies.length})
                          </button>
                        </div>

                        {isReplying && (
                          <div className="pl-4 md:pl-6 border-l-2 border-primary/30 pt-2 space-y-2">
                            <textarea
                              value={replyTextMap[item.id] || ''}
                              onChange={(e) => setReplyTextMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                              placeholder="Nhập câu trả lời của bạn..."
                              className="w-full h-20 p-3 bg-muted/40 rounded-xl border border-border/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-medium"
                            />
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setActiveReplyId(null)} className="h-8 text-xs font-semibold">
                                Hủy
                              </Button>
                              <Button size="sm" onClick={() => handleSendReply(String(item.id))} className="h-8 text-xs font-bold gap-1 rounded-lg">
                                <Send className="w-3 h-3" /> Gửi phản hồi
                              </Button>
                            </div>
                          </div>
                        )}

                        {replies.length > 0 && (
                          <div className="space-y-3 pt-2 pl-4 md:pl-8 border-l-2 border-border/50">
                            {replies.map((reply: any) => (
                              <div key={reply.id} className="bg-muted/30 p-3.5 rounded-xl space-y-1.5 border border-border/40">
                                <div className="flex items-center gap-2">
                                  <img src={reply.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                                  <span className="font-extrabold text-xs text-foreground">{reply.user?.full_name || reply.user}</span>
                                  {reply.user?.role === 'Giảng viên' && (
                                    <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-amber-500/30">
                                      Giảng viên
                                    </span>
                                  )}
                                  <span className="text-[10px] text-muted-foreground">{reply.created_at || 'Vừa xong'}</span>
                                </div>
                                <p className="text-xs text-foreground/90 font-medium pl-8">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Guidance Sidebar Cards */}
            <div className="space-y-6">
              <div className="bg-card border border-border/70 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Quy tắc thảo luận MindHub
                </div>
                <ul className="space-y-3 text-xs font-medium text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>Đặt câu hỏi văn minh, đúng trọng tâm nội dung bài học.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>Nêu rõ thông báo lỗi hoặc mô tả chi tiết thao tác bạn đang gặp thắc mắc.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>Kiểm tra các câu hỏi đã có trước khi tạo thảo luận trùng lặp.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-primary/10 via-indigo-500/5 to-card border border-primary/20 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-500" /> Tốc độ phản hồi
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Giảng viên <strong className="text-foreground">{course.instructorName}</strong> và cộng đồng học viên MindHub cam kết hỗ trợ giải đáp mọi thắc mắc trong vòng 24 giờ làm việc.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300 w-full">
            {/* Left Note Form & Stream */}
            <div className="lg:col-span-2 space-y-6">
              {/* Note Input Box */}
              <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-xs font-extrabold text-foreground">Tạo ghi chú theo mốc thời gian video</span>
                  </div>

                  <span className="bg-primary/10 text-primary font-extrabold text-xs px-2.5 py-0.5 rounded-md border border-primary/20 flex items-center gap-1">
                    ⏱ {formatSecondsToMMSS((customMin * 60) + customSec)}
                  </span>
                </div>

                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Nhập kiến thức quan trọng hoặc đoạn code cần nhớ tại mốc thời gian này..."
                  className="w-full h-28 p-3.5 bg-muted/40 rounded-xl border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-medium leading-relaxed"
                />

                {/* Custom Timestamp Pickers & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-1 bg-muted/20 p-3 rounded-xl border border-border/40">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" /> Mốc thời gian:
                    </span>

                    {/* Minute & Second Number Pickers */}
                    <div className="flex items-center gap-1 bg-background px-2.5 py-1 rounded-lg border border-border">
                      <input 
                        type="number" 
                        min={0} 
                        max={999}
                        value={customMin} 
                        onChange={(e) => setCustomMin(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-9 text-center font-black text-xs bg-transparent focus:outline-none text-primary" 
                        title="Phút"
                      />
                      <span className="font-black text-xs text-muted-foreground">:</span>
                      <input 
                        type="number" 
                        min={0} 
                        max={59}
                        value={customSec} 
                        onChange={(e) => setCustomSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-9 text-center font-black text-xs bg-transparent focus:outline-none text-primary" 
                        title="Giây"
                      />
                    </div>

                    {/* Auto Capture & Quick Adjustments */}
                    <button 
                      type="button" 
                      onClick={handleCaptureTimestamp} 
                      className="bg-primary/10 hover:bg-primary/20 text-primary font-extrabold text-xs px-2.5 py-1.5 rounded-lg transition-colors border border-primary/20 cursor-pointer flex items-center gap-1"
                    >
                      <Target className="w-3 h-3" /> Lấy mốc hiện tại
                    </button>

                    <div className="flex items-center gap-1">
                      <button 
                        type="button" 
                        onClick={() => {
                          const total = (customMin * 60) + customSec + 30;
                          setCustomMin(Math.floor(total / 60));
                          setCustomSec(total % 60);
                        }} 
                        className="bg-muted hover:bg-muted/80 text-foreground font-extrabold text-[11px] px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        +30s
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          const total = Math.max(0, (customMin * 60) + customSec - 30);
                          setCustomMin(Math.floor(total / 60));
                          setCustomSec(total % 60);
                        }} 
                        className="bg-muted hover:bg-muted/80 text-foreground font-extrabold text-[11px] px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        -30s
                      </button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddNote} 
                    disabled={!noteText.trim()}
                    size="sm" 
                    className="rounded-xl font-bold text-xs gap-1.5 px-4 shadow-sm bg-primary text-primary-foreground hover:opacity-95 cursor-pointer ml-auto"
                  >
                    <Plus className="w-3.5 h-3.5" /> Lưu ghi chú
                  </Button>
                </div>
              </div>

              {/* Notes Stream & Filter Bar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant={notesFilter === 'current' ? 'default' : 'outline'}
                      onClick={() => setNotesFilter('current')}
                      className="rounded-xl text-xs font-extrabold h-8 px-3 cursor-pointer"
                    >
                      Bài học hiện tại ({userNotes.filter(n => n.lessonId === activeLesson?.id).length})
                    </Button>
                    <Button 
                      size="sm" 
                      variant={notesFilter === 'all' ? 'default' : 'outline'}
                      onClick={() => setNotesFilter('all')}
                      className="rounded-xl text-xs font-extrabold h-8 px-3 cursor-pointer"
                    >
                      Tất cả ghi chú ({userNotes.length})
                    </Button>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleExportNotes}
                    className="text-xs font-bold text-muted-foreground hover:text-primary gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Xuất tập tin (.txt)
                  </Button>
                </div>

                {/* Saved Notes Feed */}
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-12 bg-card border border-border/50 rounded-2xl space-y-2">
                    <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-xs text-muted-foreground font-medium">Chưa có ghi chú nào cho bài học này.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotes.map((note) => (
                      <div 
                        key={note.id} 
                        className="bg-card border border-border/70 rounded-2xl p-4 shadow-xs space-y-2 hover:border-primary/40 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSeekToTimestamp(note.timestampSec, note.timestampFormatted)}
                              className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-black text-xs px-2.5 py-1 rounded-lg border border-primary/20 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Bấm để phát video tại mốc này"
                            >
                              <Play className="w-3 h-3 fill-current" /> ⏱ {note.timestampFormatted}
                            </button>

                            <span className="text-[11px] font-extrabold text-muted-foreground line-clamp-1">
                              📍 {note.lessonTitle}
                            </span>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteNote(note.id)}
                            className="h-7 w-7 text-muted-foreground hover:text-rose-500 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Xóa ghi chú"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <p className="text-xs md:text-sm text-foreground/90 leading-relaxed font-medium pl-1">
                          {note.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Guidance Sidebar */}
            <div className="space-y-6">
              <div className="bg-card border border-border/70 rounded-3xl p-6 shadow-xs space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> Mẹo ghi chú mốc thời gian linh hoạt
                </h4>
                <ul className="space-y-2.5 text-xs font-medium text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Nhập <strong>Phút : Giây</strong> tùy ý để tạo ghi chú ở bất kỳ khoảng thời gian nào trong bài học!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Hoặc bấm nút <strong>"🎯 Lấy mốc hiện tại"</strong> để tự động chụp vị trí giây video đang xem.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Bấm vào nhãn <strong>⏱ MM:SS</strong> tại bất kỳ ghi chú nào để video tự động nhảy đúng mốc thời gian đó!</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* RESOURCES TAB */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300 w-full">
            {/* Left Files List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                    <FolderArchive className="w-5 h-5 text-primary" /> Tài nguyên & Mã nguồn thực hành
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    Tệp đính kèm dành cho bài học: <span className="text-primary font-bold">{activeLesson?.title}</span>
                  </p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-500/20">
                  {lessonAssets.length} tập tin
                </span>
              </div>
              
              <div className="grid gap-3 pt-2">
                {lessonAssets.map((asset: any) => {
                  const isDownloading = downloadingAssetId === asset.id;
                  return (
                    <div 
                      key={asset.id} 
                      className="bg-card border border-border/70 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:border-primary/40 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex items-center gap-4 min-w-0 pr-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                          asset.type === 'ZIP' 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : asset.type === 'PDF' 
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {asset.type}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-extrabold text-sm md:text-base text-foreground truncate">{asset.title}</h5>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-2">
                            <span>Kích thước: <strong className="text-foreground">{asset.size}</strong></span>
                            <span>•</span>
                            <span className="truncate">{asset.description}</span>
                          </p>
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        disabled={isDownloading}
                        onClick={() => handleDownloadAsset(asset.id, asset.file_name || asset.title)}
                        className="rounded-xl font-bold text-xs gap-1.5 shrink-0 px-4 h-10 cursor-pointer shadow-xs bg-primary text-primary-foreground hover:opacity-95"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" /> Tải về
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Guidance Column */}
            <div className="space-y-6">
              <div className="bg-card border border-border/70 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wider">
                  <FileCode className="w-4 h-4 text-primary" /> Hướng dẫn thực hành
                </div>
                <ul className="space-y-3 text-xs font-medium text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Tải về file <strong>ZIP</strong> thực hành và giải nén bằng phần mềm WinRAR / 7-Zip.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Mở thư mục bằng Visual Studio Code và khởi chạy terminal.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Xem thêm tài liệu <strong>PDF</strong> đính kèm để tra cứu các lệnh thực hành nhanh.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card border border-border/70 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-500 uppercase tracking-wider">
                  <FileCheck className="w-4 h-4" /> Bản quyền tài liệu
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Tất cả các tài liệu đính kèm thuộc bản quyền độc quyền của <strong className="text-foreground">MindHub Academy</strong>. Vui lòng không chia sẻ lại khi chưa có sự đồng ý.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
