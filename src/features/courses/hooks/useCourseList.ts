import { useState, useEffect } from 'react';
import { Course } from '@/shared/types';
import { coursesApi } from '../api';

export interface CourseListFilters {
  query: string;
  categories: string[];
  levels: string[];
  minRating: number | null;
  priceType: 'all' | 'free' | 'paid';
  sortBy: 'newest' | 'popular' | 'highest-rated' | 'lowest-price' | 'highest-price';
  page: number;
  limit: number;
}

export interface UseCourseListResult {
  courses: Course[];
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
}

export function useCourseList(filters: CourseListFilters): UseCourseListResult {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const payload: any = {
          limit: filters.limit,
          page: filters.page,
          sortBy: filters.sortBy,
        };

        if (filters.query.trim()) {
          payload.query = filters.query.trim();
        }
        if (filters.categories.length > 0) {
          payload.categories = filters.categories;
        }
        if (filters.minRating !== null) {
          payload.minRating = filters.minRating;
        }
        if (filters.priceType && filters.priceType !== 'all') {
          payload.priceType = filters.priceType;
        }

        const res = await coursesApi.searchPublicCourses(payload);
        
        if (isMounted) {
          const data = res?.items || (res as any)?.data?.items || [];
          setCourses(data);
          setTotalItems(res?.totalItems || (res as any)?.data?.totalItems || 0);
          setTotalPages(res?.totalPages || (res as any)?.data?.totalPages || 0);
        }
      } catch (err: any) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 500); // debounce

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [filters]);

  return { courses, totalItems, totalPages, isLoading, error };
}
