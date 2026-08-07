import { useState, useEffect } from 'react';
import { homeApi } from '@/features/home/api';
import { CourseData } from '@/features/courses/components/CourseCard';

export interface HomepageData {
  featuredCategories: any[];
  trendingCourses: CourseData[];
  newCourses: CourseData[];
  recommendedCourses: CourseData[];
  topInstructors: any[];
}

const DEFAULT_HOMEPAGE_DATA: HomepageData = {
  featuredCategories: [
    { id: '1', name: 'Lập trình Web', slug: 'web-development', coursesCount: 12 },
    { id: '2', name: 'Khoa học Dữ liệu', slug: 'data-science', coursesCount: 8 },
    { id: '3', name: 'Thiết kế UI/UX', slug: 'ui-ux-design', coursesCount: 6 },
    { id: '4', name: 'Di động Mobile', slug: 'mobile-dev', coursesCount: 5 }
  ],
  trendingCourses: [],
  newCourses: [],
  recommendedCourses: [],
  topInstructors: [
    { id: '1', name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=1', title: 'Senior Fullstack Developer' },
    { id: '2', name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=2', title: 'Lead UI/UX Designer' }
  ]
};

export function useHomepageData() {
  const [data, setData] = useState<HomepageData>(DEFAULT_HOMEPAGE_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const res = await homeApi.getHomepageData();

        if (isMounted && res) {
          const mapCourse = (c: any): CourseData => ({
            id: String(c?.id || Math.random()),
            slug: c?.slug || '',
            title: c?.title || 'Khóa học MindHub',
            instructor: c?.instructor?.full_name || c?.instructor_name || 'Giảng viên MindHub',
            thumbnail: c?.thumbnail_url || c?.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
            duration: c?.total_duration_seconds ? `${Math.round(c.total_duration_seconds / 3600)} giờ` : '10 giờ',
            difficulty: c?.level === 'advanced' ? 'Advanced' : c?.level === 'intermediate' ? 'Intermediate' : 'Beginner',
            status: c?.is_enrolled ? 'enrolled' : 'not_enrolled'
          });

          const categories = res.categories || res.featured_categories || DEFAULT_HOMEPAGE_DATA.featuredCategories;
          const featured = (res.featured_courses || []).map(mapCourse);
          const latest = (res.latest_courses || []).map(mapCourse);
          const instructors = res.featured_instructors || DEFAULT_HOMEPAGE_DATA.topInstructors;

          setData({
            featuredCategories: categories.length ? categories : DEFAULT_HOMEPAGE_DATA.featuredCategories,
            trendingCourses: featured,
            newCourses: latest,
            recommendedCourses: latest.length ? [...latest].reverse() : featured,
            topInstructors: instructors,
          });
        }
      } catch (err: any) {
        console.warn('Cannot fetch homepage data from backend, using fallback data:', err);
        if (isMounted) {
          setError(err);
          setData(DEFAULT_HOMEPAGE_DATA);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, error };
}
