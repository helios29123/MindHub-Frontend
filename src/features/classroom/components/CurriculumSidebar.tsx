import React from 'react';
import { Course, Lesson } from '@/shared/types';
import { PlayCircle, CheckCircle, FileText, HelpCircle, X, Sparkles, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface CurriculumSidebarProps {
  course: Course | null;
  activeLessonId: string;
  completedLessonIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export function CurriculumSidebar({
  course,
  activeLessonId,
  completedLessonIds,
  isOpen,
  onClose,
  onSelectLesson
}: CurriculumSidebarProps) {
  if (!course) return null;

  const totalLessons = course.chapters.reduce((acc, c) => acc + c.lessons.length, 0);
  const totalCompleted = completedLessonIds.length;

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      case 'assignment': return <FileText className="w-4 h-4" />;
      case 'doc': return <FileText className="w-4 h-4" />;
      default: return <PlayCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`
      fixed inset-y-0 right-0 z-40 w-full sm:w-88 lg:w-96 bg-card border-l border-border/70 transform transition-all duration-300 ease-in-out shadow-2xl flex flex-col shrink-0 lg:relative
      ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none lg:w-0 lg:min-w-0 lg:overflow-hidden lg:border-l-0'}
    `}>
      {/* Sidebar Top Banner Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 text-slate-100 flex items-center justify-between shadow-xs">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 tracking-wider mb-0.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Chương trình học
          </div>
          <p className="text-xs text-slate-200 font-semibold">
            Đã học: <strong className="text-emerald-400 font-black">{totalCompleted}/{totalLessons}</strong> bài học
          </p>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden hover:bg-slate-800 text-slate-400 hover:text-white rounded-full">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Chapters Accordion Stream */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {course.chapters.map((chapter, index) => {
          const chapterCompletedCount = chapter.lessons.filter(l => completedLessonIds.includes(l.id)).length;
          const isChapterFullyCompleted = chapter.lessons.length > 0 && chapterCompletedCount === chapter.lessons.length;

          return (
            <div key={chapter.id} className="border-b border-border/50 last:border-b-0">
              {/* Chapter Title Bar */}
              <div className="p-4 bg-muted/40 sticky top-0 backdrop-blur-md z-10 border-b border-border/40 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-xs md:text-sm text-foreground tracking-tight line-clamp-1">
                    Phần {index + 1}: {chapter.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isChapterFullyCompleted 
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" 
                        : "bg-muted/80 text-muted-foreground"
                    }`}>
                      {chapterCompletedCount}/{chapter.lessons.length} bài học
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Lessons List */}
              <div className="flex flex-col divide-y divide-border/30">
                {chapter.lessons.map((lesson, lessonIndex) => {
                  const isActive = lesson.id === activeLessonId;
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson.id)}
                      className={`
                        w-full text-left p-4 flex items-start gap-3 transition-all duration-200 group relative
                        ${isActive ? 'bg-primary/10' : 'hover:bg-muted/50'}
                      `}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-r-full shadow-[2px_0_10px_rgba(var(--primary),0.5)]" />
                      )}

                      {/* Lesson Status Icon */}
                      <div className={`mt-0.5 shrink-0 transition-colors duration-200 ${
                        isActive ? 'text-primary' : isCompleted ? 'text-emerald-500' : 'text-muted-foreground/60 group-hover:text-foreground'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 drop-shadow-xs" />
                        ) : (
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${
                            isActive ? 'border-primary text-primary bg-primary/10' : 'border-current'
                          }`}>
                            {lessonIndex + 1}
                          </div>
                        )}
                      </div>
                      
                      {/* Lesson Content Info */}
                      <div className="flex-1 min-w-0 pr-2">
                        <p className={`text-xs md:text-sm leading-snug mb-1.5 transition-colors duration-200 line-clamp-2 ${
                          isActive ? 'font-black text-primary' : 'font-bold text-foreground/90 group-hover:text-primary'
                        }`}>
                          {lesson.title}
                        </p>
                        <div className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors duration-200 ${
                          isActive ? 'text-primary/80' : 'text-muted-foreground'
                        }`}>
                          {getLessonIcon(lesson.type)}
                          <span>{lesson.duration || '15:00'}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
