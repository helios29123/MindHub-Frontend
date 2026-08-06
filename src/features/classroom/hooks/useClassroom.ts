import { useState, useEffect } from 'react';
import { Course, Lesson, StudentProgress } from '@/shared/types';
import { useApp } from '@/app/AppContext';
import { useCourseDetail } from '@/features/courses/hooks/useCourseDetail';

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
  markAsCompleted: (lessonId: string) => void;
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
      } else if (!course.chapters || course.chapters.length === 0) {
        // Provide a mock chapter if backend didn't return any, so the UI doesn't break
        course.chapters = [{
          id: 'mock-chap-1',
          title: 'Chương 1: Giới thiệu (Tự động tạo)',
          lessons: [{
            id: 'mock-less-1',
            title: 'Bài 1: Tổng quan',
            duration: '05:00',
            videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            isFree: true,
            type: 'video'
          }]
        }];
        firstLesson = course.chapters[0].lessons[0];
      }

      setActiveLesson(firstLesson);

      // Mock initial progress
      setProgress({
        courseId: course.id,
        currentLessonId: firstLesson?.id || '',
        completedLessonIds: [],
        notes: [],
        bookmarks: [],
        lastWatchedProgressSec: 0
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

  const markAsCompleted = (lessonId: string) => {
    setProgress(prev => {
      if (!prev) return prev;
      if (prev.completedLessonIds.includes(lessonId)) {
        // Toggle off for testing purposes if desired, but usually we just keep it completed
        return {
          ...prev,
          completedLessonIds: prev.completedLessonIds.filter(id => id !== lessonId)
        };
      }
      return {
        ...prev,
        completedLessonIds: [...prev.completedLessonIds, lessonId]
      };
    });
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
