import { useState, useEffect } from 'react';
import { Course, Lesson, StudentProgress } from '@/shared/types';
import { useApp } from '@/app/AppContext';
import { useCourseDetail } from '@/features/courses/hooks/useCourseDetail';
import { classroomApi } from '@/features/classroom/api';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';

export type TabType = 'overview' | 'qa' | 'notes' | 'resources';

export interface UseClassroomResult {
  course: Course | null;
  activeLesson: Lesson | null;
  progress: StudentProgress | null;
  isSidebarOpen: boolean;
  activeTab: TabType;
  isLoading: boolean;
  error: Error | null;
  toggleSidebar: () => void;
  selectLesson: (lessonId: string) => void;
  markAsCompleted: (lessonId: string) => Promise<void>;
  setTab: (tab: TabType) => void;
}

export function useClassroom(courseId: string | undefined): UseClassroomResult {
  const { currentUser } = useApp();
  const { course, isLoading, error } = useCourseDetail(courseId);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    if (course) {
      // Find first lesson if exists
      let firstLesson: Lesson | null = null;
      if (course.chapters && course.chapters.length > 0 && course.chapters[0].lessons.length > 0) {
        firstLesson = course.chapters[0].lessons[0];
      }

      setActiveLesson(firstLesson);

      // Read completed lessons from localStorage cache
      const cacheKey = `mindhub_completed_lessons_${course.id}`;
      const cached = localStorage.getItem(cacheKey);
      const cachedCompletedIds: string[] = cached ? JSON.parse(cached) : [];

      setProgress({
        courseId: course.id,
        currentLessonId: firstLesson?.id || '',
        completedLessonIds: cachedCompletedIds,
        notes: [],
        bookmarks: [],
        lastWatchedProgressSec: 0
      });

      // Attempt to pull real progress from backend API
      classroomApi.getStudentCourseProgress(course.id)
        .then((res: any) => {
          if (res && res.data) {
            const apiCompletedIds = res.data.completed_lesson_ids || res.data.completed_lessons || [];
            if (Array.isArray(apiCompletedIds) && apiCompletedIds.length > 0) {
              const strIds = apiCompletedIds.map(String);
              setProgress(prev => prev ? { ...prev, completedLessonIds: strIds } : null);
              localStorage.setItem(cacheKey, JSON.stringify(strIds));
            }
          }
        })
        .catch(() => {
          // Unauthenticated or fallback gracefully
        });
    }
  }, [course]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const setTab = (tab: TabType) => setActiveTab(tab);

  const selectLesson = (lessonId: string) => {
    if (!course) return;
    for (const chapter of course.chapters) {
      const lesson = chapter.lessons.find(l => l.id === lessonId);
      if (lesson) {
        setActiveLesson(lesson);
        if (progress) {
          setProgress(prev => prev ? { ...prev, currentLessonId: lessonId } : null);
        }
        return;
      }
    }
  };

  const markAsCompleted = async (lessonId: string) => {
    if (!course) return;
    const cacheKey = `mindhub_completed_lessons_${course.id}`;

    // Update local state & storage first for instant feedback
    setProgress(prev => {
      if (!prev) return prev;
      const isAlreadyCompleted = prev.completedLessonIds.includes(lessonId);
      const nextCompleted = isAlreadyCompleted
        ? prev.completedLessonIds.filter(id => id !== lessonId)
        : [...prev.completedLessonIds, lessonId];
      
      localStorage.setItem(cacheKey, JSON.stringify(nextCompleted));
      return { ...prev, completedLessonIds: nextCompleted };
    });

    // Sync to backend DB API
    try {
      await classroomApi.markLessonAsComplete(lessonId);
    } catch (err) {
      console.warn("Could not sync complete status to backend:", err);
    }
  };

  return {
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
  };
}
