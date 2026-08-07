import { useState, useEffect } from 'react';
import { Course } from '@/shared/types';
import { coursesApi } from '@/features/courses/api';

interface UseCourseDetailResult {
  course: Course | null;
  isLoading: boolean;
  error: Error | null;
}

const DEFAULT_COURSE_THUMBNAIL = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80';
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

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

        // Unpack API response envelope if wrapped
        const rawData = data?.data || data;

        const parseList = (val: any): string[] => {
          if (Array.isArray(val)) return val.filter(Boolean);
          if (typeof val === 'string' && val.trim()) {
            return val
              .split(/\r?\n|\. /)
              .map(s => s.trim().replace(/^\s*[-•]\s*/, ''))
              .filter(s => s.length > 0);
          }
          return [];
        };

        const requirements = parseList(rawData?.requirements);
        const willLearn = parseList(rawData?.outcomes);

        let imgUrl = rawData?.thumbnail_url || rawData?.thumbnail || rawData?.image;
        if (!imgUrl || imgUrl.startsWith('/demo/')) {
          imgUrl = DEFAULT_COURSE_THUMBNAIL;
        }

        let avatarUrl = rawData?.instructor?.avatar_url || rawData?.instructor?.avatar;
        if (!avatarUrl || avatarUrl.startsWith('/demo/')) {
          avatarUrl = DEFAULT_AVATAR;
        }

        // Map backend response to frontend Course type
        const mappedCourse: Course = {
          id: String(rawData.id || courseId),
          title: rawData.title || 'Khoá học REST API Laravel',
          subtitle: rawData.short_description || rawData.subtitle || 'Xây dựng hệ thống học trực tuyến chuẩn kiến trúc chuyên nghiệp.',
          description: rawData.description || 'Khoá học thực chiến dành cho lập trình viên web.',
          category: rawData.category || 'Programming',
          subcategory: rawData.language || 'Laravel',
          instructorId: String(rawData.instructor?.id || '1'),
          instructorName: rawData.instructor?.full_name || rawData.instructor_name || 'Nguyễn Minh Khoa',
          instructorTitle: rawData.instructor?.expertise || rawData.instructor?.level || 'Senior Backend Instructor',
          instructorAvatar: avatarUrl,
          instructorBio: rawData.instructor?.bio || 'Giảng viên chuyên thiết kế hệ thống API & Microservices với hơn 6 năm kinh nghiệm.',
          price: Number(rawData.price) || 499000,
          salePrice: rawData.sale_price ? Number(rawData.sale_price) : undefined,
          rating: 4.8,
          reviewCount: rawData.reviews?.length || 120,
          enrolledCount: rawData.enrolled_count || 1500,
          completionRate: 0,
          isFeatured: !!rawData.is_featured,
          isBestseller: true,
          isNew: false,
          image: imgUrl,
          requirements: requirements.length ? requirements : ['Biết kiến thức lập trình căn bản.', 'Đã chuẩn bị môi trường Laragon hoặc XAMPP.'],
          willLearn: willLearn.length ? willLearn : [
            'Thiết kế REST API chuẩn chuẩn hóa theo Repository / Service Pattern.',
            'Quản lý Custom Session, Authentication & OAuth Google.',
            'Tích hợp luồng thanh toán (Payment Flow) & Đăng ký khóa học.',
            'Viết Automated Test kiểm tra chất lượng API với Pest/PHPUnit.'
          ],
          status: 'active',
          chapters: (rawData.sections || []).map((sec: any) => ({
            id: String(sec.id || Math.random()),
            title: sec.title || 'Chương học',
            lessons: (sec.lessons || []).map((l: any) => ({
              id: String(l.id || Math.random()),
              title: l.title || 'Bài học',
              type: (l.lesson_type === 'video' || l.type === 'video') ? 'video' : 'document',
              duration: l.video_duration_seconds ? `${Math.ceil(l.video_duration_seconds / 60)} phút` : '10 phút',
              videoUrl: l.video_url || '',
              isPreview: !!l.is_preview
            }))
          })),
          reviews: (rawData.reviews || []).map((r: any) => ({
            id: String(r.id || Math.random()),
            userId: String(r.user_id || '1'),
            userName: r.reviewer?.full_name || r.user_name || 'Học viên MindHub',
            userAvatar: DEFAULT_AVATAR,
            rating: r.rating || 5,
            comment: r.comment || '',
            createdAt: r.created_at || 'Mới đây'
          })),
          faqs: rawData.faqs || []
        };

        setCourse(mappedCourse);
        setIsLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.warn('Failed to load course details from API, using safe fallback:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  return { course, isLoading, error };
}
