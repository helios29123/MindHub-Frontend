import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, PlayCircle, Check, ChevronDown, ChevronRight, 
  Video, FileText, Users, Award, Shield, MonitorPlay,
  HelpCircle, CheckCircle2, Zap, Clock,
  Sparkles, RefreshCw, Share2, Heart, ArrowUpRight
} from 'lucide-react';

import { useApp } from '@/app/AppContext';
import { useCourseDetail } from './hooks/useCourseDetail';
import { coursesApi } from './api';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { CourseDetailSkeleton } from './components/CourseDetailSkeleton';
import { CourseCard, CourseData } from './components/CourseCard';
import { ReviewList } from '@/features/reviews/ReviewList';
import { INITIAL_COURSES } from '@/shared/data';
import { toast } from 'sonner';

const DEFAULT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80';
const DEFAULT_AVATAR_FALLBACK = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, isLoading, error } = useCourseDetail(courseId);
  
  const { cart, setCart, enrolledCourseIds } = useApp();
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<CourseData[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    coursesApi.getCourses()
      .then((res: any) => {
        const rawList = Array.isArray(res) ? res : res?.data || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          const filtered = rawList
            .filter((c: any) => String(c.id) !== String(course?.id) && c.slug !== courseId)
            .slice(0, 3)
            .map((c: any) => ({
              id: String(c.id),
              title: c.title || 'Khoá học MindHub',
              instructor: c.instructor?.full_name || 'Giảng viên MindHub',
              thumbnail: c.thumbnail_url || c.thumbnail || '',
              duration: c.total_duration_seconds ? `${Math.round(c.total_duration_seconds / 3600)}h` : '20h 30m',
              difficulty: (c.level === 'advanced' ? 'Advanced' : c.level === 'intermediate' ? 'Intermediate' : 'Beginner') as any,
              slug: c.slug || String(c.id)
            }));

          if (filtered.length > 0) {
            setRelatedCourses(filtered);
            return;
          }
        }

        const fallback = INITIAL_COURSES
          .filter(c => c.id !== course?.id)
          .slice(0, 3)
          .map(c => ({
            id: c.id,
            title: c.title,
            instructor: c.instructorName,
            thumbnail: c.image,
            duration: "20h 30m",
            difficulty: "Beginner" as const
          }));
        setRelatedCourses(fallback);
      })
      .catch((err) => {
        console.warn('Could not fetch related courses from API:', err);
      });
  }, [course?.id, courseId]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const handleEnrollNow = () => {
    if (!course) return;

    if (enrolledCourseIds.includes(course.id)) {
      navigate(`/learn/${course.id}`);
      return;
    }
    setCart([course.id]);
    toast.success(`Đang mở trang thanh toán cho "${course.title}"`);
    navigate(`/checkout?courseId=${course.id}`, { state: { course } });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Đã sao chép liên kết khóa học!');
  };
  };

  if (isLoading) return <CourseDetailSkeleton />;

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <EmptyState 
          title="Không tìm thấy khoá học" 
          description="Khoá học bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ." 
          actionLabel="Trở về trang chủ"
          onAction={() => navigate("/")}
        />
      </div>
    );
  }

  const isEnrolled = enrolledCourseIds.includes(course.id);
  const displayImage = imgSrc || course.image || DEFAULT_IMAGE_FALLBACK;
  const displayAvatar = avatarSrc || course.instructorAvatar || DEFAULT_AVATAR_FALLBACK;

  const totalLessons = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const discountPercent = course.salePrice ? Math.round(((course.price - course.salePrice) / course.price) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-24 selection:bg-primary/20">
      
      {/* 1. MODERN RICH HERO BANNER */}
      <div className="relative bg-slate-950 text-white pt-8 pb-20 md:pb-28 px-4 md:px-8 border-b border-slate-800/80 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Breadcrumb */}
            <nav className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-slate-400 font-medium">
              <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                Trang chủ
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <Link to="/courses" className="hover:text-primary transition-colors">{course.category}</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-200 truncate max-w-[220px] md:max-w-xs">{course.title}</span>
            </nav>
            
            {/* Badges & Highlights */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-gradient-to-r from-primary/25 to-indigo-500/25 text-primary border border-primary/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                {course.subcategory || 'Lập trình Web'}
              </span>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 fill-current" /> Đề xuất cao
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Chuẩn Thực Chiến
              </span>
            </div>

            {/* Main Title & Subtitle */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-slate-50 tracking-tight">
              {course.title}
            </h1>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl">
              {course.subtitle}
            </p>
            
            {/* Rating Stars & Enrollment Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm pt-1">
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
                <span className="text-xl font-black text-amber-400">{course.rating.toFixed(1)}</span>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-slate-400 text-xs font-medium ml-1">({course.reviewCount} đánh giá)</span>
              </div>

              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{course.enrolledCount.toLocaleString()} học viên đã tham gia</span>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Cập nhật mới nhất: 10/2026</span>
              </div>
            </div>
            
            {/* Instructor Highlight Line */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-3.5">
                <img 
                  src={displayAvatar} 
                  alt={course.instructorName} 
                  onError={() => setAvatarSrc(DEFAULT_AVATAR_FALLBACK)}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary shadow-lg shrink-0" 
                />
                <div>
                  <p className="text-sm font-bold text-slate-100">
                    Giảng viên: <span className="text-primary hover:underline cursor-pointer" onClick={() => navigate(`/instructors/${course.instructorId}`)}>{course.instructorName}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-medium">{course.instructorTitle || 'Chuyên gia thiết kế hệ thống tại MindHub'}</p>
                </div>
              </div>

              {/* Share & Wishlist Buttons */}
              <div className="hidden sm:flex items-center gap-2">
                <button 
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800"
                  title="Chia sẻ khóa học"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setIsWishlisted(!isWishlisted);
                    toast.success(isWishlisted ? 'Đã xoá khỏi mục yêu thích' : 'Đã thêm vào mục yêu thích');
                  }}
                  className={`p-2.5 rounded-full border transition-colors ${isWishlisted ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'}`}
                  title="Yêu thích"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID + STICKY FLOATING SINGLE-COURSE PURCHASE CARD */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT MAIN CONTENT COLUMN */}
          <div className="lg:col-span-2 space-y-12 pt-8">

            {/* MOBILE FLOATING PURCHASE CARD */}
            <div className="block lg:hidden rounded-2xl overflow-hidden shadow-2xl border border-border bg-card mb-8">
              <div className="relative aspect-video bg-black">
                <img 
                  src={displayImage} 
                  alt={course.title} 
                  onError={() => setImgSrc(DEFAULT_IMAGE_FALLBACK)}
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white fill-white/20 backdrop-blur-md rounded-full shadow-2xl" />
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-foreground">
                    {course.salePrice ? `${course.salePrice.toLocaleString()}đ` : course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()}đ`}
                  </span>
                  {course.salePrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">{course.price.toLocaleString()}đ</span>
                      <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs px-2 py-0.5 rounded-md border border-rose-500/20">
                        -{discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>

                {isEnrolled ? (
                  <Button className="w-full h-12 text-base font-extrabold shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => navigate(`/learn/${course.id}`)}>
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Vào học ngay
                  </Button>
                ) : (
                  <Button className="w-full h-12 text-base font-extrabold tracking-wide shadow-xl bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 hover:opacity-95 text-white" onClick={handleEnrollNow}>
                    <Zap className="w-5 h-5 mr-2 text-amber-300 fill-amber-300" />
                    {course.price === 0 ? 'Tham gia ngay (Miễn phí)' : 'Đăng ký học ngay'}
                  </Button>
                )}
              </div>
            </div>

            {/* WHAT YOU'LL LEARN */}
            <section className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <h2 className="text-2xl font-black mb-6 text-foreground flex items-center gap-2.5 tracking-tight">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                Bạn sẽ học được gì
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.willLearn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 bg-muted/20 hover:bg-muted/40 p-4 rounded-2xl border border-border/50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-sm font-semibold leading-relaxed text-foreground/90">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* CURRICULUM OUTLINE ACCORDION */}
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <h2 className="text-2xl font-black text-foreground tracking-tight">Nội dung khoá học</h2>
                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <span className="bg-muted px-3 py-1 rounded-full">{course.chapters.length} Chương</span>
                  <span>•</span>
                  <span className="bg-muted px-3 py-1 rounded-full">{totalLessons} Bài học</span>
                </div>
              </div>
              
              <div className="border border-border/80 rounded-3xl overflow-hidden bg-card shadow-sm divide-y divide-border/60">
                {course.chapters.map((chapter, index) => {
                  const isExpanded = expandedChapters[chapter.id] ?? (index === 0);
                  return (
                    <div key={chapter.id} className="transition-colors">
                      <button 
                        className="w-full flex items-center justify-between p-5 bg-muted/20 hover:bg-muted/50 transition-colors text-left"
                        onClick={() => toggleChapter(chapter.id)}
                      >
                        <div className="flex items-center gap-3.5">
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="w-5 h-5 text-primary" />
                          </motion.div>
                          <span className="font-extrabold text-foreground text-base">{chapter.title}</span>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          {chapter.lessons.length} bài học
                        </span>
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-card"
                          >
                            <div className="p-3 divide-y divide-border/30">
                              {chapter.lessons.map((lesson) => (
                                <div key={lesson.id} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-muted/40 transition-colors group">
                                  <div className="flex items-center gap-3.5">
                                    {lesson.type === 'video' ? (
                                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <Video className="w-4 h-4 text-primary" />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                      </div>
                                    )}
                                    <span className={`text-sm font-semibold ${lesson.isPreview ? 'text-primary hover:underline cursor-pointer' : 'text-foreground/90'}`}>
                                      {lesson.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    {lesson.isPreview && (
                                      <span className="text-[11px] font-extrabold px-2.5 py-1 bg-primary/15 text-primary rounded-full uppercase tracking-wider">
                                        Xem thử
                                      </span>
                                    )}
                                    <span className="text-xs font-medium text-muted-foreground">{lesson.duration}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* REQUIREMENTS */}
            {course.requirements.length > 0 && (
              <section className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">Yêu cầu khóa học</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground font-medium bg-muted/20 p-3 rounded-xl border border-border/40">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* DETAILED DESCRIPTION */}
            <section className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">Mô tả chi tiết</h2>
              <div 
                className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground text-sm leading-relaxed" 
                dangerouslySetInnerHTML={{ __html: course.description }} 
              />
            </section>

            {/* INSTRUCTOR CARD */}
            <section className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">Thông tin giảng viên</h2>
              <div className="flex flex-col sm:flex-row gap-6">
                <img 
                  src={displayAvatar} 
                  alt={course.instructorName} 
                  onError={() => setAvatarSrc(DEFAULT_AVATAR_FALLBACK)}
                  className="w-28 h-28 rounded-2xl object-cover shadow-xl border-2 border-primary shrink-0" 
                />
                <div className="space-y-3">
                  <div>
                    <h3 
                      className="text-xl font-bold text-foreground hover:text-primary cursor-pointer transition-colors flex items-center gap-1.5" 
                      onClick={() => navigate(`/instructors/${course.instructorId}`)}
                    >
                      {course.instructorName}
                      <ArrowUpRight className="w-4 h-4 text-primary" />
                    </h3>
                    <p className="text-xs font-semibold text-primary">{course.instructorTitle}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                      <Star className="w-3.5 h-3.5 fill-current" /> {course.rating.toFixed(1)} Đánh giá
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                      <Users className="w-3.5 h-3.5" /> {course.enrolledCount.toLocaleString()} Học viên
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground font-medium">{course.instructorBio}</p>
                </div>
              </div>
            </section>

            {/* FAQ SECTION */}
            {course.faqs && course.faqs.length > 0 && (
              <section className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2.5 tracking-tight">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Câu hỏi thường gặp
                </h2>
                <div className="space-y-3">
                  {course.faqs.map((faq: any, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-1">
                      <p className="font-bold text-sm text-foreground">Q: {faq.question}</p>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* REVIEWS SECTION */}
            <section className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold mb-6 text-foreground tracking-tight">Đánh giá từ học viên</h2>
              <ReviewList targetId={course.id} type="course" />
            </section>
          </div>

          {/* RIGHT FLOATING STICKY SINGLE-COURSE PURCHASE CARD (DESKTOP) */}
          <div className="hidden lg:block">
            <div className="sticky top-20 -mt-52 md:-mt-60 lg:-mt-72 z-30 rounded-3xl border border-border/80 shadow-2xl bg-card overflow-hidden transition-all duration-300 hover:border-primary/40">
              
              {/* Media Video Box */}
              <div className="relative group cursor-pointer aspect-video bg-black overflow-hidden">
                <img 
                  src={displayImage} 
                  alt={course.title} 
                  onError={() => setImgSrc(DEFAULT_IMAGE_FALLBACK)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" 
                />
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center group-hover:bg-slate-950/20 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-10 h-10 text-white fill-white" />
                  </div>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-6 space-y-6">
                
                {/* Price Header */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black tracking-tight text-foreground">
                      {course.salePrice ? `${course.salePrice.toLocaleString()}đ` : course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()}đ`}
                    </span>
                    {course.salePrice && (
                      <>
                        <span className="text-base font-semibold text-muted-foreground line-through">
                          {course.price.toLocaleString()}đ
                        </span>
                        <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs px-2.5 py-0.5 rounded-md border border-rose-500/20">
                          -{discountPercent}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  {course.salePrice && (
                    <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Giảm giá có hạn áp dụng trong tuần này
                    </p>
                  )}
                </div>
                
                {/* Single High-Converting Action Button */}
                {isEnrolled ? (
                  <Button 
                    className="w-full h-13 text-base font-extrabold shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all transform hover:scale-[1.02]" 
                    onClick={() => navigate(`/learn/${course.id}`)}
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Vào học ngay
                  </Button>
                ) : (
                  <Button 
                    className="w-full h-13 text-base font-black tracking-wide shadow-xl bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 hover:opacity-95 text-white transform hover:scale-[1.02] transition-all" 
                    onClick={handleEnrollNow}
                  >
                    <Zap className="w-5 h-5 mr-2 text-amber-300 fill-amber-300" />
                    {course.price === 0 ? 'Tham gia ngay (Miễn phí)' : 'Đăng ký học ngay'}
                  </Button>
                )}
                
                {/* Course Guarantee Badge */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 text-center text-xs font-semibold text-muted-foreground flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Đảm bảo bảo mật & hoàn tiền 7 ngày</span>
                </div>

                {/* Features List */}
                <div className="pt-4 border-t border-border/60">
                  <h4 className="font-extrabold text-sm text-foreground mb-4">Khoá học này bao gồm:</h4>
                  <div className="space-y-3.5 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <MonitorPlay className="w-4 h-4 text-primary shrink-0" />
                      <span>{totalLessons} Bài giảng video chất lượng cao</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>Tài liệu & Mã nguồn thực hành đi kèm</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Chứng chỉ hoàn thành cấp bởi MindHub</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Quyền truy cập trọn đời & Cập nhật mới</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* 3. RELATED COURSES */}
        {relatedCourses.length > 0 && (
          <div className="mt-24 border-t border-border/80 pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Khoá học liên quan</h2>
                <p className="text-xs font-medium text-muted-foreground mt-1">Các khóa học cùng lĩnh vực được học viên quan tâm nhiều nhất</p>
              </div>
              <Link to="/courses" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.map(c => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
