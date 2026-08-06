import { useState, useEffect } from 'react';
import { Course } from '@/shared/types';
import { ApiService } from '@/services/api';

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

export interface CategoryOption {
  name: string;
  count: number;
}

export interface UseCourseListResult {
  courses: Course[];
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  categoriesList: CategoryOption[];
  refetch: () => void;
}

export function useCourseList(filters: CourseListFilters): UseCourseListResult {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const refetch = () => setReloadTrigger(prev => prev + 1);

  // Fetch dynamic categories directly from DB
  useEffect(() => {
    let active = true;
    async function loadCategories() {
      try {
        const catData = await ApiService.getCategoriesWithCount();
        if (active && Array.isArray(catData)) {
          // Sort categories by course count descending, then name ascending
          const sorted = [...catData].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
          setCategoriesList(sorted);
        }
      } catch (e) {
        console.warn('Failed to fetch DB categories:', e);
      }
    }

    loadCategories();
    return () => { active = false; };
  }, [reloadTrigger]);

  // Main Course Fetching directly from DB
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function fetchCourseDataFromDb() {
      try {
        const config = ApiService.getConfig();
        const backendOrigin = config.baseUrl.replace(/\/api\/?$/, '');

        const apiParams: Record<string, any> = {
          page: filters.page,
          per_page: filters.limit,
          status: 'published'
        };

        if (filters.query.trim()) {
          apiParams.search = filters.query.trim();
        }

        if (filters.categories.length === 1) {
          apiParams.category_slug = filters.categories[0].toLowerCase().replace(/\s+/g, '-');
        }

        if (filters.levels.length === 1) {
          const lvlMap: Record<string, string> = {
            'Cơ bản': 'beginner',
            'Trung cấp': 'intermediate',
            'Nâng cao': 'advanced'
          };
          apiParams.level = lvlMap[filters.levels[0]] || filters.levels[0].toLowerCase();
        }

        if (filters.priceType === 'free') {
          apiParams.max_price = 0;
        } else if (filters.priceType === 'paid') {
          apiParams.min_price = 1000;
        }

        // Sorting map
        const sortMap: Record<string, string> = {
          'newest': 'latest',
          'popular': 'popular',
          'highest-rated': 'rating_desc',
          'lowest-price': 'price_asc',
          'highest-price': 'price_desc'
        };
        apiParams.sort = sortMap[filters.sortBy] || 'latest';

        const responseData: any = await ApiService.getCourses(apiParams);

        if (!isMounted) return;

        let rawItems: any[] = [];
        let total = 0;
        let pages = 1;

        if (Array.isArray(responseData)) {
          rawItems = responseData;
          total = (responseData as any).meta?.total ?? rawItems.length;
          pages = (responseData as any).meta?.last_page ?? Math.ceil(total / filters.limit);
        } else if (responseData && Array.isArray(responseData.data)) {
          rawItems = responseData.data;
          total = responseData.meta?.total ?? rawItems.length;
          pages = responseData.meta?.last_page ?? Math.ceil(total / filters.limit);
        }

        // Strict DB filter: ONLY published/active courses
        rawItems = rawItems.filter((item: any) => 
          !item.status || item.status === 'published' || item.status === 'active'
        );

        // Map DB CatalogCourseResource into Course type
        const mappedCourses: Course[] = rawItems.map((item: any) => {
          let thumb = item.thumbnail_url || '';
          if (thumb && thumb.startsWith('/')) {
            thumb = `${backendOrigin}${thumb}`;
          }

          return {
            id: String(item.id),
            title: item.title || 'Khóa học MindHub',
            subtitle: item.short_description || item.title || '',
            description: item.short_description || '',
            category: item.categories?.[0]?.name || 'Công nghệ',
            subcategory: 'General',
            instructorId: item.instructor?.id ? String(item.instructor.id) : 'ins-1',
            instructorName: item.instructor?.full_name || 'Giảng viên MindHub',
            instructorTitle: 'Giảng viên Chuyên nghiệp',
            instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            instructorBio: 'Giảng viên giàu kinh nghiệm tại MindHub Academy',
            image: thumb || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
            price: typeof item.price === 'number' ? item.price : 299000,
            salePrice: typeof item.sale_price === 'number' ? item.sale_price : null,
            rating: typeof item.average_rating === 'number' ? item.average_rating : 4.8,
            reviewCount: typeof item.reviews_count === 'number' ? item.reviews_count : 0,
            enrolledCount: typeof item.enrollments_count === 'number' ? item.enrollments_count : 0,
            completionRate: 92,
            isFeatured: Boolean(item.is_featured),
            isBestseller: false,
            isNew: true,
            status: 'active',
            chapters: [],
            requirements: item.level ? [`Cấp độ: ${item.level}`] : ['Phù hợp với mọi đối tượng'],
            willLearn: ['Nắm vững kiến thức nền tảng và nâng cao'],
            targetAudience: ['Học viên muốn làm chủ kỹ năng mới'],
            slug: item.slug || String(item.id),
            createdAt: item.published_at || new Date().toISOString(),
            updatedAt: item.published_at || new Date().toISOString()
          };
        });

        setCourses(mappedCourses);
        setTotalItems(total);
        setTotalPages(Math.max(1, pages));
        setIsLoading(false);
      } catch (err: any) {
        console.error('DB fetch courses error:', err);
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      }
    }

    const timer = setTimeout(fetchCourseDataFromDb, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [filters, reloadTrigger]);

  return { courses, totalItems, totalPages, isLoading, error, categoriesList, refetch };
}
