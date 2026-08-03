import { useState, useEffect } from 'react';
import { Course } from '@/shared/types';
import { coursesApi } from '@/features/courses/api';

interface UseCourseDetailResult {
  course: Course | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCourseDetail(courseId: string | undefined): UseCourseDetailResult {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    if (!courseId) {
      setIsLoading(false);
      setError(new Error('Course ID is missing'));
      return;
    }

    coursesApi.getCourseBySlug(courseId)
      .then((data: any) => {
        if (!isMounted) return;
        
        // Map backend response to frontend Course type
        const mappedCourse: Course = {
          id: data.id?.toString() || courseId,
          title: data.title || '',
          subtitle: data.short_description || '',
          description: data.description || '',
          category: data.category || 'Programming',
          subcategory: data.language || '',
          instructorId: data.instructor?.id?.toString() || '1',
          instructorName: data.instructor?.full_name || 'Unknown',
          instructorTitle: data.instructor?.expertise || '',
          instructorAvatar: data.instructor?.bio || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
          instructorBio: data.instructor?.bio || '',
          price: data.price || 0,
          salePrice: data.sale_price,
          rating: 4.8, // Mocked rating
          reviewCount: 120, // Mocked review count
          enrolledCount: 1500, // Mocked enrolled count
          completionRate: 0,
          isFeatured: !!data.is_featured,
          isBestseller: false,
          isNew: false,
          image: data.thumbnail_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
          requirements: Array.isArray(data.requirements) ? data.requirements : [],
          willLearn: Array.isArray(data.outcomes) ? data.outcomes : [],
          status: 'active',
          chapters: (data.sections || []).map((sec: any) => ({
            id: sec.id?.toString(),
            title: sec.title,
            lessons: (sec.lessons || []).map((l: any) => ({
              id: l.id?.toString(),
              title: l.title,
              type: l.content_type === 'video' ? 'video' : 'document',
              duration: Math.floor((l.duration_seconds || 0) / 60) + 'm',
              videoUrl: l.video_url,
              isPreview: !!l.is_preview
            }))
          })),
          reviews: [],
          faqs: data.faqs || []
        };
        
        setCourse(mappedCourse);
        setIsLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  return { course, isLoading, error };
}
