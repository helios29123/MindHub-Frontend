import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { BookOpen, PlayCircle, Trophy, Target, Clock, Heart, Loader2, ArrowRight, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { ApiService } from '@/services/api';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { toast } from 'sonner';

export default function MyCoursesPage() {
  const [activeTab, setActiveTab] = useState<'learning' | 'completed' | 'saved'>('learning');
  const navigate = useNavigate();
  
  const [learningCourses, setLearningCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [savedCourses, setSavedCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function loadData() {
      try {
        const [myCoursesRes, wishlistRes] = await Promise.allSettled([
          ApiService.getMyPurchasedCourses(),
          ApiService.getWishlist()
        ]);

        if (!isMounted) return;

        const backendConfig = ApiService.getConfig();
        const backendOrigin = backendConfig.baseUrl.replace(/\/api\/?$/, '');

        // 1. Process Purchased / Enrolled Courses
        let rawPurchased: any[] = [];
        if (myCoursesRes.status === 'fulfilled') {
          const val = myCoursesRes.value;
          rawPurchased = Array.isArray(val) ? val : ((val as any)?.data || []);
        }

        const mappedPurchased = rawPurchased.map((item: any) => {
          const courseData = item.course || item;
          let thumb = courseData.thumbnail_url || courseData.image || '';
          if (thumb && thumb.startsWith('/')) {
            thumb = `${backendOrigin}${thumb}`;
          }

          const progress = typeof item.progress_percent === 'number' 
            ? item.progress_percent 
            : (typeof item.progress === 'number' ? item.progress : 0);

          return {
            id: String(courseData.id || item.id),
            title: courseData.title || 'Khóa học MindHub',
            slug: courseData.slug || String(courseData.id || item.id),
            image: thumb || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
            instructorName: courseData.instructor?.full_name || courseData.instructorName || 'Giảng viên MindHub',
            progress: Math.min(100, Math.max(0, Math.round(progress))),
            totalDurationSeconds: courseData.total_duration_seconds || 18000,
            status: item.status || (progress >= 100 ? 'completed' : 'active')
          };
        });

        // 1b. Merge with Local Enrolled Courses Cache
        let localEnrolledList: any[] = [];
        try {
          const storedListStr = localStorage.getItem('mindhub_enrolled_course_list');
          if (storedListStr) {
            localEnrolledList = JSON.parse(storedListStr);
          }
        } catch (e) {}

        const combinedPurchased = [...mappedPurchased];
        const existingIds = new Set(mappedPurchased.map(c => String(c.id)));

        localEnrolledList.forEach(item => {
          const itemCourseId = String(item.id || item.courseId);
          if (!existingIds.has(itemCourseId)) {
            existingIds.add(itemCourseId);
            combinedPurchased.push({
              id: itemCourseId,
              title: item.title || 'Khóa học MindHub',
              slug: item.slug || itemCourseId,
              image: item.image || item.thumbnail_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
              instructorName: item.instructorName || 'Giảng viên MindHub',
              progress: typeof item.progress === 'number' ? item.progress : 15,
              totalDurationSeconds: item.totalDurationSeconds || 18000,
              status: item.progress >= 100 ? 'completed' : 'active'
            });
          }
        });

        const learning = combinedPurchased.filter(c => c.progress < 100 && c.status !== 'completed');
        const completed = combinedPurchased.filter(c => c.progress >= 100 || c.status === 'completed');

        // 2. Process Wishlist / Saved Courses
        let rawWishlist: any[] = [];
        if (wishlistRes.status === 'fulfilled') {
          const val = wishlistRes.value;
          rawWishlist = Array.isArray(val) ? val : ((val as any)?.data || []);
        }

        const mappedWishlist = rawWishlist.map((item: any) => {
          const courseData = item.course || item;
          let thumb = courseData.thumbnail_url || courseData.image || '';
          if (thumb && thumb.startsWith('/')) {
            thumb = `${backendOrigin}${thumb}`;
          }

          return {
            id: String(courseData.id || item.id),
            title: courseData.title || 'Khóa học MindHub',
            slug: courseData.slug || String(courseData.id || item.id),
            image: thumb || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
            instructorName: courseData.instructor?.full_name || courseData.instructorName || 'Giảng viên MindHub',
            price: courseData.price || 0,
            salePrice: courseData.sale_price ?? courseData.price
          };
        });

        setLearningCourses(learning);
        setCompletedCourses(completed);
        setSavedCourses(mappedWishlist);
      } catch (err) {
        console.error('Error loading my courses:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  const getDisplayCourses = () => {
    switch(activeTab) {
      case 'learning': return learningCourses;
      case 'completed': return completedCourses;
      case 'saved': return savedCourses;
      default: return learningCourses;
    }
  };

  const displayCourses = getDisplayCourses();
  const totalCoursesCount = learningCourses.length + completedCourses.length;
  const totalXp = completedCourses.length * 150 + learningCourses.reduce((acc, c) => acc + Math.round(c.progress * 0.8), 0);
  const totalStudyHours = Math.round(learningCourses.length * 4.5 + completedCourses.length * 12);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 pt-6">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          {/* Header Title Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Learner Hub
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Khóa học của tôi</h1>
              <p className="text-xs text-muted-foreground mt-1">Quản lý tiến độ học tập và các khóa học đã ghi danh</p>
            </div>
            
            <Button 
              onClick={() => navigate('/courses')}
              className="rounded-2xl h-11 px-5 font-bold shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
            >
              <span>Khám phá khóa học mới</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Dashboard Header Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border/70 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xs hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3 text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-black text-2xl text-foreground">{totalCoursesCount}</h3>
              <p className="text-[11px] text-muted-foreground uppercase font-extrabold tracking-wider mt-1">Khóa học</p>
            </div>

            <div className="bg-card border border-border/70 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xs hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-3 text-emerald-600">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-black text-2xl text-foreground">{completedCourses.length}</h3>
              <p className="text-[11px] text-muted-foreground uppercase font-extrabold tracking-wider mt-1">Hoàn thành</p>
            </div>

            <div className="bg-card border border-border/70 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xs hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-3 text-amber-600">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-black text-2xl text-foreground">{totalXp}</h3>
              <p className="text-[11px] text-muted-foreground uppercase font-extrabold tracking-wider mt-1">XP Nhận được</p>
            </div>

            <div className="bg-card border border-border/70 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xs hover:border-indigo-500/40 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-3 text-indigo-600">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-black text-2xl text-foreground">{totalStudyHours}h</h3>
              <p className="text-[11px] text-muted-foreground uppercase font-extrabold tracking-wider mt-1">Thời gian học</p>
            </div>
          </div>

          {isLoading && (
            <div className="bg-card border border-border/70 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-xs">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="font-bold text-foreground text-sm">Đang tải dữ liệu khóa học từ hệ thống...</p>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Tab Switcher */}
              <div className="flex items-center gap-2 mb-8 border-b border-border/60 pb-4 overflow-x-auto whitespace-nowrap">
                <Button 
                  variant={activeTab === 'learning' ? 'default' : 'ghost'} 
                  onClick={() => setActiveTab('learning')}
                  className={`rounded-2xl gap-2 h-10 px-5 font-extrabold text-xs transition-all ${activeTab === 'learning' ? 'shadow-xs' : 'text-muted-foreground'}`}
                >
                  <PlayCircle className="w-4 h-4" /> Đang học ({learningCourses.length})
                </Button>

                <Button 
                  variant={activeTab === 'completed' ? 'default' : 'ghost'} 
                  onClick={() => setActiveTab('completed')}
                  className={`rounded-2xl gap-2 h-10 px-5 font-extrabold text-xs transition-all ${activeTab === 'completed' ? 'shadow-xs' : 'text-muted-foreground'}`}
                >
                  <Trophy className="w-4 h-4" /> Đã hoàn thành ({completedCourses.length})
                </Button>

                <Button 
                  variant={activeTab === 'saved' ? 'default' : 'ghost'} 
                  onClick={() => setActiveTab('saved')}
                  className={`rounded-2xl gap-2 h-10 px-5 font-extrabold text-xs transition-all ${activeTab === 'saved' ? 'shadow-xs' : 'text-muted-foreground'}`}
                >
                  <Heart className="w-4 h-4" /> Đã lưu ({savedCourses.length})
                </Button>
              </div>

              {/* Courses List */}
              {displayCourses.length === 0 ? (
                <div className="bg-card border border-border/70 rounded-3xl p-12 shadow-xs text-center">
                  <EmptyState
                    icon={BookOpen}
                    title={activeTab === 'saved' ? "Chưa có khóa học nào được lưu" : "Chưa ghi danh khóa học nào"}
                    description={
                      activeTab === 'saved' 
                        ? "Bạn chưa lưu khóa học yêu thích nào. Hãy khám phá danh mục khóa học và nhấn lưu những khóa học bạn quan tâm!"
                        : "Bạn chưa đăng ký học khóa học nào trong mục này. Tham khảo ngay các khóa học chất lượng trên MindHub."
                    }
                    actionLabel="Khám phá khóa học ngay"
                    onAction={() => navigate('/courses')}
                  />
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {displayCourses.map((course: any) => (
                    <div 
                      key={course.id} 
                      className="group bg-card border border-border/70 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Cover Image */}
                        <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                          <img 
                            src={course.image} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center">
                            <Link to={activeTab === 'saved' ? `/courses/${course.slug || course.id}` : `/learn/${course.id}`}>
                              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                <PlayCircle className="w-6 h-6 fill-current" />
                              </div>
                            </Link>
                          </div>

                          {activeTab === 'completed' && (
                            <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1 shadow-md">
                              <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                            </div>
                          )}
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-5 space-y-3">
                          <Link to={activeTab === 'saved' ? `/courses/${course.slug || course.id}` : `/learn/${course.id}`}>
                            <h3 className="font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem] text-sm leading-snug">
                              {course.title}
                            </h3>
                          </Link>

                          <div className="text-xs text-muted-foreground font-medium">
                            Giảng viên: <strong className="text-foreground">{course.instructorName}</strong>
                          </div>

                          {/* Progress bar (Only for Learning & Completed) */}
                          {(activeTab === 'learning' || activeTab === 'completed') && (
                            <div className="pt-2">
                              <div className="flex justify-between text-[11px] font-extrabold uppercase text-muted-foreground mb-1.5">
                                <span>Tiến độ bài học</span>
                                <span className={course.progress === 100 ? "text-emerald-600 font-black" : "text-primary font-black"}>
                                  {course.progress}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${course.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-indigo-500'}`} 
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-5 pt-0 border-t border-border/40 mt-3 flex items-center justify-between gap-2">
                        {activeTab === 'completed' ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full rounded-xl gap-2 text-xs font-bold h-9" 
                            onClick={() => navigate('/certificates')}
                          >
                            <Award className="w-4 h-4 text-emerald-600" /> Xem chứng chỉ
                          </Button>
                        ) : activeTab === 'learning' ? (
                          <Link to={`/learn/${course.id}`} className="w-full">
                            <Button 
                              size="sm" 
                              className="w-full rounded-xl gap-1.5 text-xs font-bold h-9 bg-primary text-primary-foreground shadow-xs"
                            >
                              <span>Học tiếp</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        ) : (
                          <Link to={`/courses/${course.slug || course.id}`} className="w-full">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              className="w-full rounded-xl gap-1.5 text-xs font-bold h-9"
                            >
                              <span>Xem chi tiết khóa học</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
