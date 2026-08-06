import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, ChevronLeft, ChevronRight, CheckCircle2, Circle, Sparkles, Award } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ClassroomSkeleton } from "./components/ClassroomSkeleton";
import { useClassroom } from "./hooks/useClassroom";
import { VideoPlayer } from "./components/VideoPlayer";
import { CurriculumSidebar } from "./components/CurriculumSidebar";
import { ClassroomTabs } from "./components/ClassroomTabs";
import { toast } from "sonner";

export default function ClassroomPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const {
    course,
    activeLesson,
    progress,
    isSidebarOpen,
    activeTab,
    isLoading,
    error,
    toggleSidebar,
    selectLesson,
    markAsCompleted,
    setTab
  } = useClassroom(courseId);

  if (isLoading) {
    return <ClassroomSkeleton />;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <EmptyState 
          title="Không tìm thấy khoá học"
          description="Khoá học này không tồn tại hoặc bạn không có quyền truy cập."
          actionLabel="Trở về trang chủ"
          onAction={() => navigate("/")}
        />
      </div>
    );
  }

  const allLessons = course.chapters.flatMap(ch => ch.lessons);
  const totalLessons = allLessons.length;
  const completedCount = progress?.completedLessonIds.length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const currentIndex = allLessons.findIndex(l => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isCurrentCompleted = activeLesson ? (progress?.completedLessonIds.includes(activeLesson.id) || false) : false;

  const handleVideoEnded = () => {
    if (activeLesson) {
      markAsCompleted(activeLesson.id);
      toast.success(`Đã hoàn thành bài học: "${activeLesson.title}"`);
    }
  };

  const handleToggleCompleted = () => {
    if (!activeLesson) return;
    markAsCompleted(activeLesson.id);
    if (!isCurrentCompleted) {
      toast.success(`Đã đánh dấu hoàn thành bài học!`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* Top Navbar specifically for Classroom (Dark Mode) */}
      <header className="h-16 shrink-0 bg-slate-950 text-slate-200 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 z-20 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/courses/${course.id}`)}
            className="hover:bg-slate-800 text-slate-300 hover:text-white transition-colors rounded-xl shrink-0"
            title="Trở về chi tiết khoá học"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm md:text-base truncate text-white leading-tight" title={course.title}>
              {course.title}
            </h1>
            {activeLesson && (
              <p className="text-xs text-slate-400 font-medium truncate hidden sm:block mt-0.5">
                Bài {currentIndex + 1}: <span className="text-primary font-bold">{activeLesson.title}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              Tiến độ: <span className="text-emerald-400 font-black">{completedCount}/{totalLessons}</span> bài ({progressPercent}%)
            </div>
            <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <Button 
            variant="ghost" 
            onClick={toggleSidebar}
            className={`flex items-center gap-2 transition-all rounded-xl font-bold text-xs h-9 px-3.5 border cursor-pointer shadow-xs ${
              isSidebarOpen 
                ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700' 
                : 'bg-slate-900 text-slate-100 border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Menu className="w-4 h-4 text-white" />
            <span className="hidden sm:inline font-extrabold text-white">Chương trình học</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Video & Content */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-background transition-all duration-300">
          {/* Video Frame Box */}
          <div className="w-full bg-black border-b border-border/40 shadow-md flex justify-center">
            <div className="w-full max-w-[1400px]">
              <VideoPlayer 
                activeLesson={activeLesson}
                onEnded={handleVideoEnded}
              />
            </div>
          </div>

          {/* Action Control Bar under Player */}
          <div className="w-full bg-card border-b border-border/60 py-3.5 px-4 md:px-8 shadow-xs">
            <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-black uppercase text-primary tracking-wider bg-primary/10 px-2.5 py-1 rounded-md shrink-0">
                  Đang học
                </span>
                <h2 className="font-extrabold text-sm md:text-base text-foreground truncate">
                  {activeLesson?.title || 'Chọn bài học'}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && selectLesson(prevLesson.id)}
                  className="rounded-xl text-xs font-bold gap-1 h-9 px-3"
                >
                  <ChevronLeft className="w-4 h-4" /> Bài trước
                </Button>

                <Button
                  size="sm"
                  variant={isCurrentCompleted ? "secondary" : "default"}
                  onClick={handleToggleCompleted}
                  className={`rounded-xl text-xs font-extrabold gap-1.5 h-9 px-4 transition-all ${
                    isCurrentCompleted 
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" 
                      : "bg-primary text-primary-foreground shadow-xs"
                  }`}
                >
                  {isCurrentCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" /> Đã hoàn thành
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" /> Hoàn thành bài học
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && selectLesson(nextLesson.id)}
                  className="rounded-xl text-xs font-bold gap-1 h-9 px-3"
                >
                  Bài tiếp <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Bottom Tabs Panel */}
          <div className="flex-1 w-full bg-background/50">
            <div className="max-w-[1400px] mx-auto w-full pb-16">
              <ClassroomTabs 
                course={course}
                activeLesson={activeLesson}
                activeTab={activeTab}
                onTabChange={setTab}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Curriculum Sidebar */}
        <CurriculumSidebar 
          course={course}
          activeLessonId={activeLesson?.id || ''}
          completedLessonIds={progress?.completedLessonIds || []}
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          onSelectLesson={selectLesson}
        />
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30" 
            onClick={toggleSidebar}
          />
        )}
      </main>
    </div>
  );
}
