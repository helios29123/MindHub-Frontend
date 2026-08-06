import { apiFetch, devLog } from '@/shared/lib/api-client';
import { ApiService } from '@/services/api';

export interface RoadmapSummary {
  id: string;
  category: 'web' | 'mobile' | 'data' | 'cloud' | 'fullstack';
  categoryLabel: string;
  title: string;
  description: string;
  coursesCount: number;
  duration: string;
  badge?: string;
  salary: string;
  demand: string;
  skills: string[];
  gradient?: string;
  borderHover?: string;
  iconBg?: string;
  textColor?: string;
  studentsCount?: number;
}

export interface RoadmapStepCourse {
  id: string;
  slug: string;
  title: string;
  instructor: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  thumbnail: string;
  tags: string[];
  level: string;
  isEnrolled?: boolean;
  videoUrl?: string;
  videoDuration?: string;
}

export interface RoadmapMilestoneStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked';
  duration: string;
  estimatedHours: string;
  concepts: string[];
  projectTitle?: string;
  videoUrl?: string;
  videoTitle?: string;
  videoDuration?: string;
  courses: RoadmapStepCourse[];
}

export interface RoadmapDetailData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  badge: string;
  totalCourses: number;
  totalMonths: string;
  totalHours: string;
  avgSalary: string;
  hiringDemand: string;
  skills: string[];
  gradientTheme: string;
  accentBg: string;
  textColor: string;
  steps: RoadmapMilestoneStep[];
}

// Built-in metadata templates for IT domain roadmaps
const ROADMAP_METADATA_TEMPLATES: Record<string, {
  category: 'web' | 'mobile' | 'data' | 'cloud' | 'fullstack';
  categoryLabel: string;
  title: string;
  description: string;
  badge: string;
  salary: string;
  demand: string;
  skills: string[];
  gradient: string;
  borderHover: string;
  iconBg: string;
  textColor: string;
  gradientTheme: string;
  accentBg: string;
  keywords: string[];
}> = {
  frontend: {
    category: 'web',
    categoryLabel: 'Web Development',
    title: 'Frontend Developer',
    description: 'Trở thành kỹ sư Frontend chuyên nghiệp với HTML, CSS, JavaScript, React, Next.js và TypeScript.',
    badge: 'Phổ biến nhất',
    salary: '15 - 35 triệu/tháng',
    demand: 'Rất cao (🔥 Hot)',
    skills: ['HTML5/CSS3', 'JavaScript ES6+', 'TypeScript', 'ReactJS', 'Next.js', 'Tailwind CSS'],
    gradient: 'from-blue-500/10 via-sky-500/5 to-transparent',
    borderHover: 'group-hover:border-blue-500/40 hover:shadow-blue-500/10',
    iconBg: 'bg-blue-500/10 text-blue-600 border-blue-200/50',
    textColor: 'text-blue-600 dark:text-blue-400',
    gradientTheme: 'from-blue-600 via-indigo-600 to-sky-700',
    accentBg: 'bg-blue-500/10 border-blue-200 text-blue-600 dark:text-blue-400',
    keywords: ['react', 'frontend', 'html', 'css', 'javascript', 'typescript', 'vue', 'next']
  },
  backend: {
    category: 'web',
    categoryLabel: 'Web Development',
    title: 'Backend Developer',
    description: 'Xây dựng hệ thống backend quy mô lớn với Node.js, Laravel, Python, Database & RESTful API Architecture.',
    badge: 'Hot Career',
    salary: '18 - 40 triệu/tháng',
    demand: 'Rất cao',
    skills: ['Node.js', 'Laravel', 'PHP', 'PostgreSQL', 'Redis', 'Microservices', 'REST API'],
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    borderHover: 'group-hover:border-emerald-500/40 hover:shadow-emerald-500/10',
    iconBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    gradientTheme: 'from-emerald-600 via-teal-600 to-cyan-700',
    accentBg: 'bg-emerald-500/10 border-emerald-200 text-emerald-600 dark:text-emerald-400',
    keywords: ['laravel', 'backend', 'php', 'node', 'express', 'sql', 'database', 'api', 'python', 'java']
  },
  fullstack: {
    category: 'fullstack',
    categoryLabel: 'Fullstack',
    title: 'Fullstack Engineer',
    description: 'Chinh phục cả Frontend và Backend, làm chủ toàn bộ quy trình phát triển sản phẩm web từ A-Z.',
    badge: 'Được săn đón',
    salary: '20 - 45 triệu/tháng',
    demand: 'Đột phá',
    skills: ['ReactJS', 'Node.js', 'Laravel', 'TypeScript', 'Docker', 'AWS'],
    gradient: 'from-indigo-500/10 via-purple-500/5 to-transparent',
    borderHover: 'group-hover:border-indigo-500/40 hover:shadow-indigo-500/10',
    iconBg: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    gradientTheme: 'from-indigo-600 via-purple-600 to-pink-700',
    accentBg: 'bg-indigo-500/10 border-indigo-200 text-indigo-600 dark:text-indigo-400',
    keywords: ['fullstack', 'react', 'laravel', 'node', 'web']
  },
  data: {
    category: 'data',
    categoryLabel: 'Data & AI',
    title: 'Data Engineering & AI',
    description: 'Xử lý dữ liệu lớn, làm chủ Data Pipeline, Python, SQL, Machine Learning & Tích hợp AI/LLM.',
    badge: 'Xu hướng 2026',
    salary: '22 - 50 triệu/tháng',
    demand: 'Tăng trưởng nóng',
    skills: ['Python', 'SQL', 'PySpark', 'Kafka', 'Data Warehouse', 'LLM Integration'],
    gradient: 'from-purple-500/10 via-fuchsia-500/5 to-transparent',
    borderHover: 'group-hover:border-purple-500/40 hover:shadow-purple-500/10',
    iconBg: 'bg-purple-500/10 text-purple-600 border-purple-200/50',
    textColor: 'text-purple-600 dark:text-purple-400',
    gradientTheme: 'from-purple-600 via-fuchsia-600 to-indigo-700',
    accentBg: 'bg-purple-500/10 border-purple-200 text-purple-600 dark:text-purple-400',
    keywords: ['data', 'python', 'ai', 'sql', 'machine learning', 'analytics']
  },
  mobile: {
    category: 'mobile',
    categoryLabel: 'Mobile Dev',
    title: 'Mobile App Developer',
    description: 'Xây dựng ứng dụng di động đa nền tảng mượt mà cho iOS & Android với React Native & Flutter.',
    badge: 'Nhu cầu cao',
    salary: '16 - 35 triệu/tháng',
    demand: 'Cao',
    skills: ['Flutter', 'Dart', 'React Native', 'Swift/Kotlin', 'Firebase', 'App Publishing'],
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    borderHover: 'group-hover:border-amber-500/40 hover:shadow-amber-500/10',
    iconBg: 'bg-amber-500/10 text-amber-600 border-amber-200/50',
    textColor: 'text-amber-600 dark:text-amber-400',
    gradientTheme: 'from-amber-600 via-orange-600 to-red-700',
    accentBg: 'bg-amber-500/10 border-amber-200 text-amber-600 dark:text-amber-400',
    keywords: ['mobile', 'flutter', 'react native', 'ios', 'android', 'dart']
  },
  devops: {
    category: 'cloud',
    categoryLabel: 'DevOps & Cloud',
    title: 'DevOps & Cloud Engineer',
    description: 'Tự động hóa triển khai CI/CD, quản trị hạ tầng đám mây với Docker, Kubernetes, Linux & AWS.',
    badge: 'Mức lương cao',
    salary: '25 - 55 triệu/tháng',
    demand: 'Rất cao',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD Pipeline', 'Linux Admin'],
    gradient: 'from-sky-500/10 via-blue-500/5 to-transparent',
    borderHover: 'group-hover:border-sky-500/40 hover:shadow-sky-500/10',
    iconBg: 'bg-sky-500/10 text-sky-600 border-sky-200/50',
    textColor: 'text-sky-600 dark:text-sky-400',
    gradientTheme: 'from-sky-600 via-blue-600 to-indigo-700',
    accentBg: 'bg-sky-500/10 border-sky-200 text-sky-600 dark:text-sky-400',
    keywords: ['devops', 'docker', 'kubernetes', 'aws', 'cloud', 'linux', 'ci/cd']
  }
};

/**
 * Helper to map backend course response format to unified RoadmapStepCourse format
 */

const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
];

function mapRawCourseToStepCourse(raw: any, enrolledIds: string[] = []): RoadmapStepCourse {
  const id = String(raw.id || raw.course_id || Math.random());
  const isEnrolled = raw.is_enrolled || enrolledIds.includes(id);
  const sampleIdx = Math.abs(id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % SAMPLE_VIDEOS.length;
  const videoUrl = raw.intro_video_url || raw.video_url || SAMPLE_VIDEOS[sampleIdx];

  return {
    id,
    slug: raw.slug || id,
    title: raw.title || raw.name || 'Khóa học thực chiến MindHub',
    instructor: typeof raw.instructor === 'string' 
      ? raw.instructor 
      : (raw.instructor?.full_name || raw.instructor?.name || 'Giảng viên MindHub'),
    price: typeof raw.price === 'number' ? raw.price : (parseFloat(raw.price) || 0),
    salePrice: raw.sale_price !== null && raw.sale_price !== undefined 
      ? (typeof raw.sale_price === 'number' ? raw.sale_price : parseFloat(raw.sale_price)) 
      : undefined,
    rating: raw.average_rating ? Number(raw.average_rating) : (raw.rating ? Number(raw.rating) : 4.8),
    reviewCount: raw.reviews_count ?? raw.review_count ?? 120,
    enrolledCount: raw.enrollments_count ?? raw.enrolled_count ?? 850,
    thumbnail: raw.thumbnail_url || raw.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    tags: Array.isArray(raw.categories) 
      ? raw.categories.map((c: any) => c.name || c.title) 
      : (raw.tags || ['MindHub', 'Thực chiến']),
    level: raw.level ? (raw.level.charAt(0).toUpperCase() + raw.level.slice(1)) : 'Intermediate',
    isEnrolled,
    videoUrl,
    videoDuration: '14:20'
  };
}

export const roadmapsApi = {
  /**
   * Fetch all roadmap catalog items, enriched dynamically with real backend courses and categories
   */
  async getRoadmaps(): Promise<RoadmapSummary[]> {
    devLog('Roadmaps', 'Fetching real roadmap catalog from backend API');
    try {
      // Parallel fetch categories and published courses from real backend
      const [categoriesRes, coursesRes] = await Promise.allSettled([
        apiFetch<any>('/categories'),
        apiFetch<any>('/courses')
      ]);

      let backendCourses: any[] = [];
      if (coursesRes.status === 'fulfilled' && coursesRes.value) {
        const val: any = coursesRes.value;
        backendCourses = Array.isArray(val) ? val : (val.data || val.courses || []);
      }

      let backendCategories: any[] = [];
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value) {
        const val: any = categoriesRes.value;
        backendCategories = Array.isArray(val) ? val : (val.data || val.categories || []);
      }

      const totalBackendCourses = backendCourses.length;

      // Construct dynamic roadmap summaries enriched with real backend count metrics
      const roadmaps: RoadmapSummary[] = Object.keys(ROADMAP_METADATA_TEMPLATES).map((key) => {
        const tpl = ROADMAP_METADATA_TEMPLATES[key];

        // Filter backend courses matching roadmap keywords or categories
        const matchingCourses = backendCourses.filter((c: any) => {
          const text = `${c.title || ''} ${c.short_description || ''} ${c.slug || ''}`.toLowerCase();
          const categoryNames = Array.isArray(c.categories) 
            ? c.categories.map((cat: any) => (cat.name || '').toLowerCase()) 
            : [];
          
          return tpl.keywords.some((kw) => text.includes(kw) || categoryNames.some(cn => cn.includes(kw)));
        });

        const coursesCount = matchingCourses.length > 0 ? matchingCourses.length : Math.max(1, Math.ceil(totalBackendCourses / 6));
        const totalDurationHours = matchingCourses.reduce((acc, c) => acc + (c.total_duration_seconds ? Math.round(c.total_duration_seconds / 3600) : 15), 0);
        const durationText = totalDurationHours > 0 ? `${Math.ceil(totalDurationHours / 30)} tháng (${totalDurationHours} giờ)` : '6 tháng';

        // Calculate total student enrollments across matching courses
        const studentsCount = matchingCourses.reduce((acc, c) => acc + (c.enrollments_count || 0), 1200);

        return {
          id: key,
          category: tpl.category,
          categoryLabel: tpl.categoryLabel,
          title: tpl.title,
          description: tpl.description,
          coursesCount,
          duration: durationText,
          badge: tpl.badge,
          salary: tpl.salary,
          demand: tpl.demand,
          skills: tpl.skills,
          gradient: tpl.gradient,
          borderHover: tpl.borderHover,
          iconBg: tpl.iconBg,
          textColor: tpl.textColor,
          studentsCount,
        };
      });

      return roadmaps;
    } catch (err) {
      console.warn('Error fetching real roadmap catalog:', err);
      // Fallback default empty or standard list
      return Object.keys(ROADMAP_METADATA_TEMPLATES).map((key) => {
        const tpl = ROADMAP_METADATA_TEMPLATES[key];
        return {
          id: key,
          category: tpl.category,
          categoryLabel: tpl.categoryLabel,
          title: tpl.title,
          description: tpl.description,
          coursesCount: 0,
          duration: '6 tháng',
          badge: tpl.badge,
          salary: tpl.salary,
          demand: tpl.demand,
          skills: tpl.skills,
          gradient: tpl.gradient,
          borderHover: tpl.borderHover,
          iconBg: tpl.iconBg,
          textColor: tpl.textColor,
          studentsCount: 0
        };
      });
    }
  },

  /**
   * Fetch specific Roadmap details & populate milestones dynamically with real backend courses
   */
  async getRoadmapDetail(roadmapId: string): Promise<RoadmapDetailData> {
    devLog('Roadmaps', `Fetching detailed backend courses for roadmap: ${roadmapId}`);
    
    const key = ROADMAP_METADATA_TEMPLATES[roadmapId] ? roadmapId : 'frontend';
    const tpl = ROADMAP_METADATA_TEMPLATES[key];

    // Fetch real backend courses and user's enrolled courses in parallel
    let allBackendCourses: any[] = [];
    let enrolledCourseIds: string[] = [];

    try {
      const [coursesRes, purchasedRes] = await Promise.allSettled([
        apiFetch<any>('/courses'),
        ApiService.getMyPurchasedCourses()
      ]);

      if (coursesRes.status === 'fulfilled' && coursesRes.value) {
        const val: any = coursesRes.value;
        allBackendCourses = Array.isArray(val) ? val : (val.data || val.courses || []);
      }

      if (purchasedRes.status === 'fulfilled' && purchasedRes.value) {
        const val: any = purchasedRes.value;
        const purchasedList = Array.isArray(val) ? val : (val?.data || []);
        enrolledCourseIds = purchasedList.map((item: any) => String(item.course?.id || item.id));
      }
    } catch (e) {
      console.warn('Failed to load courses from API for roadmap detail:', e);
    }

    // Also include locally stored enrolled course IDs if any
    try {
      const storedIdsStr = localStorage.getItem('mindhub_enrolled_courses');
      if (storedIdsStr) {
        const stored: string[] = JSON.parse(storedIdsStr);
        stored.forEach(id => {
          if (!enrolledCourseIds.includes(String(id))) enrolledCourseIds.push(String(id));
        });
      }
    } catch (e) {}

    // Keywords mapping per step to ensure 100% strict relevance to step topic
    const STEP_KEYWORDS: Record<string, Record<number, string[]>> = {
      frontend: {
        1: ['html', 'css', 'git', 'responsive', 'web'],
        2: ['javascript', 'js', 'es6', 'async', 'dom'],
        3: ['react', 'redux', 'hooks', 'state', 'tailwind'],
        4: ['next', 'typescript', 'ssr', 'vercel', 'performance']
      },
      backend: {
        1: ['sql', 'database', 'postgres', 'mysql', 'db'],
        2: ['laravel', 'php', 'node', 'express', 'api', 'rest'],
        3: ['redis', 'auth', 'jwt', 'microservice', 'caching'],
        4: ['docker', 'system', 'design', 'concurrency', 'scaling']
      },
      fullstack: {
        1: ['web', 'html', 'css', 'javascript', 'git'],
        2: ['react', 'typescript', 'frontend', 'tailwind'],
        3: ['laravel', 'node', 'api', 'backend', 'postgresql'],
        4: ['docker', 'next', 'aws', 'deploy', 'fullstack']
      },
      data: {
        1: ['python', 'sql', 'analysis', 'pandas'],
        2: ['pipeline', 'warehouse', 'etl', 'airflow'],
        3: ['spark', 'pyspark', 'kafka', 'big data'],
        4: ['ai', 'llm', 'langchain', 'machine learning']
      },
      mobile: {
        1: ['dart', 'mobile', 'oop', 'swift', 'kotlin'],
        2: ['flutter', 'react native', 'cross platform', 'ui'],
        3: ['riverpod', 'provider', 'state', 'architecture'],
        4: ['firebase', 'app store', 'play store', 'push']
      },
      devops: {
        1: ['linux', 'bash', 'shell', 'networking', 'security'],
        2: ['docker', 'ci/cd', 'github actions', 'container'],
        3: ['kubernetes', 'k8s', 'terraform', 'iac'],
        4: ['aws', 'cloud', 'prometheus', 'grafana', 'monitoring']
      }
    };

    // Curated step-specific fallback courses matching exact step topic if backend lacks specific course
    const STEP_CURATED_FALLBACKS: Record<string, Record<number, RoadmapStepCourse[]>> = {
      frontend: {
        1: [
          {
            id: 'fe-step1-html-css',
            slug: 'web-fundamentals-html-css-git',
            title: 'Xây dựng Website Đầu tiên với HTML5, CSS3 Modern & Git',
            instructor: 'Trần Hoàng Nam',
            price: 399000,
            salePrice: 199000,
            rating: 4.8,
            reviewCount: 240,
            enrolledCount: 1450,
            thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
            tags: ['HTML5', 'CSS3', 'Git', 'Responsive'],
            level: 'Beginner',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoDuration: '15:30'
          }
        ],
        2: [
          {
            id: 'fe-step2-js-es6',
            slug: 'javascript-es6-async-mastery',
            title: 'Master JavaScript ES6+ & Lập trình Bất đồng bộ Thực chiến',
            instructor: 'Lê Hoàng Bảo',
            price: 599000,
            salePrice: 349000,
            rating: 4.9,
            reviewCount: 420,
            enrolledCount: 2100,
            thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80',
            tags: ['JavaScript', 'ES6+', 'Async/Await'],
            level: 'Intermediate',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            videoDuration: '20:15'
          }
        ],
        3: [
          {
            id: 'fe-step3-react18-redux',
            slug: 'react-18-redux-toolkit-hooks',
            title: 'Chinh phục React 18, Redux Toolkit & Custom Hooks',
            instructor: 'Nguyễn Minh Khoa',
            price: 699000,
            salePrice: 399000,
            rating: 4.9,
            reviewCount: 510,
            enrolledCount: 2680,
            thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
            tags: ['React 18', 'Redux Toolkit', 'Custom Hooks'],
            level: 'Intermediate',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            videoDuration: '22:45'
          }
        ],
        4: [
          {
            id: 'fe-step4-nextjs14-typescript',
            slug: 'nextjs-14-typescript-fullstack-production',
            title: 'Lập trình Next.js 14 App Router & TypeScript Chuyên nghiệp',
            instructor: 'Phạm Thành Nam',
            price: 799000,
            salePrice: 499000,
            rating: 5.0,
            reviewCount: 310,
            enrolledCount: 1540,
            thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
            tags: ['Next.js 14', 'TypeScript', 'SSR'],
            level: 'Advanced',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoDuration: '24:10'
          }
        ]
      },
      backend: {
        1: [
          {
            id: 'be-step1-database-sql',
            slug: 'database-design-postgresql-sql-optimization',
            title: 'Thiết kế Cơ sở Dữ liệu & Tối ưu SQL PostgreSQL',
            instructor: 'Vũ Hải Đăng',
            price: 499000,
            salePrice: 299000,
            rating: 4.8,
            reviewCount: 310,
            enrolledCount: 1650,
            thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
            tags: ['PostgreSQL', 'SQL', 'Database Design'],
            level: 'Beginner',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            videoDuration: '16:40'
          }
        ],
        2: [
          {
            id: 'be-step2-laravel-rest-api',
            slug: 'laravel-rest-api-tu-co-ban-den-trien-khai',
            title: 'Lập trình Laravel RESTful API & Node.js Express',
            instructor: 'Trần Hoàng Nam',
            price: 699000,
            salePrice: 399000,
            rating: 4.9,
            reviewCount: 480,
            enrolledCount: 2300,
            thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
            tags: ['Laravel', 'REST API', 'Node.js'],
            level: 'Intermediate',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            videoDuration: '19:30'
          }
        ],
        3: [
          {
            id: 'be-step3-redis-microservices',
            slug: 'redis-caching-microservices-architecture',
            title: 'Kiến trúc Microservices, Redis Caching & OAuth2 Authentication',
            instructor: 'Phạm Thành Nam',
            price: 799000,
            salePrice: 499000,
            rating: 4.9,
            reviewCount: 290,
            enrolledCount: 1420,
            thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&q=80',
            tags: ['Redis', 'Microservices', 'Security'],
            level: 'Advanced',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            videoDuration: '23:15'
          }
        ],
        4: [
          {
            id: 'be-step4-system-design',
            slug: 'system-design-high-concurrency-scaling',
            title: 'Thiết kế Hệ thống Xử lý Tải cao (High Concurrency System Design)',
            instructor: 'Lê Hoàng Bảo',
            price: 899000,
            salePrice: 599000,
            rating: 5.0,
            reviewCount: 195,
            enrolledCount: 980,
            thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
            tags: ['System Design', 'Docker', 'Scaling'],
            level: 'Advanced',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoDuration: '26:00'
          }
        ]
      },
      fullstack: {
        1: [
          {
            id: 'fs-step1-web-fundamentals',
            slug: 'fullstack-web-fundamentals-html-css-javascript',
            title: 'Fullstack Foundation: Web Standards, HTML5, CSS3 & JavaScript ES6+',
            instructor: 'Trần Hoàng Nam',
            price: 499000,
            salePrice: 299000,
            rating: 4.8,
            reviewCount: 350,
            enrolledCount: 1950,
            thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
            tags: ['HTML5', 'CSS3', 'JavaScript'],
            level: 'Beginner',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            videoDuration: '17:10'
          }
        ],
        2: [
          {
            id: 'fs-step2-frontend-react-ts',
            slug: 'fullstack-react-typescript-tailwind',
            title: 'Lập trình Frontend Chuyên nghiệp với ReactJS, TypeScript & Tailwind',
            instructor: 'Nguyễn Minh Khoa',
            price: 699000,
            salePrice: 399000,
            rating: 4.9,
            reviewCount: 420,
            enrolledCount: 2210,
            thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
            tags: ['ReactJS', 'TypeScript', 'Tailwind'],
            level: 'Intermediate',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            videoDuration: '21:30'
          }
        ],
        3: [
          {
            id: 'fs-step3-backend-laravel-node',
            slug: 'fullstack-backend-laravel-node-postgresql',
            title: 'Phát triển Backend API với Laravel, Node.js & PostgreSQL',
            instructor: 'Vũ Hải Đăng',
            price: 799000,
            salePrice: 499000,
            rating: 4.9,
            reviewCount: 380,
            enrolledCount: 1890,
            thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
            tags: ['Laravel', 'Node.js', 'PostgreSQL'],
            level: 'Intermediate',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            videoDuration: '23:40'
          }
        ],
        4: [
          {
            id: 'fs-step4-nextjs-docker',
            slug: 'fullstack-nextjs-docker-aws-deployment',
            title: 'Fullstack Web App với Next.js, Docker Container & AWS Deploy',
            instructor: 'Phạm Thành Nam',
            price: 899000,
            salePrice: 599000,
            rating: 5.0,
            reviewCount: 290,
            enrolledCount: 1420,
            thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
            tags: ['Next.js', 'Docker', 'AWS'],
            level: 'Advanced',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoDuration: '27:15'
          }
        ]
      },
      data: {
        1: [
          {
            id: 'data-step1-python-sql',
            slug: 'python-for-data-analysis-and-sql',
            title: 'Lập trình Python Cho Phân Tích Dữ Liệu & Truy Vấn SQL',
            instructor: 'Đỗ Hoàng Khôi',
            price: 499000,
            salePrice: 299000,
            rating: 4.9,
            reviewCount: 380,
            enrolledCount: 1780,
            thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
            tags: ['Python', 'SQL', 'Pandas'],
            level: 'Beginner',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            videoDuration: '18:50'
          }
        ],
        2: [
          {
            id: 'data-step2-pipeline-warehouse',
            slug: 'data-engineering-pipeline-data-warehouse',
            title: 'Xây Dựng Data Pipeline & Data Warehouse Với PostgreSQL & Airflow',
            instructor: 'Đỗ Hoàng Khôi',
            price: 699000,
            salePrice: 399000,
            rating: 4.9,
            reviewCount: 290,
            enrolledCount: 1320,
            thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
            tags: ['ETL', 'Airflow', 'Data Warehouse'],
            level: 'Intermediate',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            videoDuration: '22:10'
          }
        ],
        3: [
          {
            id: 'data-step3-pyspark-kafka',
            slug: 'pyspark-big-data-processing-kafka-streaming',
            title: 'Xử Lý Dữ Liệu Lớn Với PySpark, Apache Spark & Kafka Streaming',
            instructor: 'Vũ Hải Đăng',
            price: 799000,
            salePrice: 499000,
            rating: 5.0,
            reviewCount: 210,
            enrolledCount: 980,
            thumbnail: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=80',
            tags: ['PySpark', 'Spark', 'Kafka'],
            level: 'Advanced',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            videoDuration: '25:40'
          }
        ],
        4: [
          {
            id: 'data-step4-ai-llm-langchain',
            slug: 'ai-llm-integration-langchain-python',
            title: 'Tích Hợp AI, Large Language Models (LLM) & LangChain Thực Chiến',
            instructor: 'Đỗ Hoàng Khôi',
            price: 899000,
            salePrice: 599000,
            rating: 5.0,
            reviewCount: 410,
            enrolledCount: 1850,
            thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80',
            tags: ['AI', 'LLM', 'LangChain'],
            level: 'Advanced',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoDuration: '28:15'
          }
        ]
      },
      mobile: {
        1: [
          {
            id: 'mob-step1-dart-basics',
            slug: 'dart-programming-language-basics',
            title: 'Lập Trình Nền Tảng Ngôn Ngữ Dart & Tư Duy Hướng Đối Tượng OOP',
            instructor: 'Lê Hoàng Bảo',
            price: 399000,
            salePrice: 199000,
            rating: 4.8,
            reviewCount: 210,
            enrolledCount: 1120,
            thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
            tags: ['Dart', 'OOP', 'Mobile Basics'],
            level: 'Beginner',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            videoDuration: '16:15'
          }
        ],
        2: [
          {
            id: 'mob-step2-flutter-ui',
            slug: 'flutter-cross-platform-mobile-app-development',
            title: 'Xây Dựng Ứng Dụng Di Động Đa Nền Tảng Với Flutter & Material UI',
            instructor: 'Lê Hoàng Bảo',
            price: 699000,
            salePrice: 399000,
            rating: 4.9,
            reviewCount: 380,
            enrolledCount: 1940,
            thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80',
            tags: ['Flutter', 'Dart', 'Mobile App'],
            level: 'Intermediate',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            videoDuration: '20:30'
          }
        ],
        3: [
          {
            id: 'mob-step3-state-management',
            slug: 'flutter-state-management-provider-riverpod',
            title: 'Quản Lý State Nâng Cao Trong Flutter Với Provider & Riverpod',
            instructor: 'Nguyễn Minh Khoa',
            price: 699000,
            salePrice: 399000,
            rating: 4.9,
            reviewCount: 260,
            enrolledCount: 1350,
            thumbnail: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&q=80',
            tags: ['Flutter', 'Riverpod', 'State Management'],
            level: 'Intermediate',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            videoDuration: '21:50'
          }
        ],
        4: [
          {
            id: 'mob-step4-firebase-publishing',
            slug: 'flutter-firebase-backend-app-store-publishing',
            title: 'Tích Hợp Firebase, Push Notifications & Triển Khai App Store / Play Store',
            instructor: 'Phạm Thành Nam',
            price: 799000,
            salePrice: 499000,
            rating: 5.0,
            reviewCount: 190,
            enrolledCount: 980,
            thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
            tags: ['Firebase', 'App Store', 'Play Store'],
            level: 'Advanced',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoDuration: '25:10'
          }
        ]
      },
      devops: {
        1: [
          {
            id: 'dev-step1-linux-bash',
            slug: 'linux-administration-shell-scripting',
            title: 'Quản Trị Hệ Thống Linux Shell Scripting & Networking Fundamentals',
            instructor: 'Vũ Hải Đăng',
            price: 499000,
            salePrice: 299000,
            rating: 4.8,
            reviewCount: 230,
            enrolledCount: 1250,
            thumbnail: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80',
            tags: ['Linux', 'Bash', 'Networking'],
            level: 'Beginner',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            videoDuration: '17:30'
          }
        ],
        2: [
          {
            id: 'dev-step2-docker-cicd',
            slug: 'docker-containerization-github-actions-cicd',
            title: 'Đóng Gói Ứng Dụng Với Docker & Tự Động Hóa CI/CD GitHub Actions',
            instructor: 'Phạm Thành Nam',
            price: 699000,
            salePrice: 399000,
            rating: 4.9,
            reviewCount: 410,
            enrolledCount: 2150,
            thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&q=80',
            tags: ['Docker', 'CI/CD', 'GitHub Actions'],
            level: 'Intermediate',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            videoDuration: '21:10'
          }
        ],
        3: [
          {
            id: 'dev-step3-kubernetes-terraform',
            slug: 'kubernetes-k8s-orchestration-terraform-iac',
            title: 'Điều Phối Container Với Kubernetes (K8s) & Infrastructure as Code Terraform',
            instructor: 'Phạm Thành Nam',
            price: 799000,
            salePrice: 499000,
            rating: 4.9,
            reviewCount: 280,
            enrolledCount: 1420,
            thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
            tags: ['Kubernetes', 'K8s', 'Terraform'],
            level: 'Advanced',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            videoDuration: '26:20'
          }
        ],
        4: [
          {
            id: 'dev-step4-aws-cloud-monitoring',
            slug: 'aws-cloud-architecture-prometheus-grafana-monitoring',
            title: 'Kiến Trúc Đám Mây AWS Cloud, Prometheus & Grafana Monitoring',
            instructor: 'Vũ Hải Đăng',
            price: 899000,
            salePrice: 599000,
            rating: 5.0,
            reviewCount: 220,
            enrolledCount: 1100,
            thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
            tags: ['AWS', 'Cloud', 'Prometheus', 'Grafana'],
            level: 'Advanced',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoDuration: '29:00'
          }
        ]
      }
    };

    // Helper to get strictly relevant courses for a specific milestone step
    const getStepCourses = (stepNum: number): RoadmapStepCourse[] => {
      const stepKw = STEP_KEYWORDS[key]?.[stepNum] || [];
      const backendMatches = allBackendCourses.filter((c: any) => {
        const text = `${c.title || ''} ${c.short_description || ''} ${c.slug || ''}`.toLowerCase();
        const categoryNames = Array.isArray(c.categories) 
          ? c.categories.map((cat: any) => (cat.name || '').toLowerCase()) 
          : [];
        return stepKw.some(kw => text.includes(kw) || categoryNames.some(cn => cn.includes(kw)));
      });

      const mappedBackend = backendMatches.map(c => mapRawCourseToStepCourse(c, enrolledCourseIds));
      const fallbackList = STEP_CURATED_FALLBACKS[key]?.[stepNum] || [];

      // Combine real backend matching courses with curated topic courses, avoiding duplicates
      const result: RoadmapStepCourse[] = [...mappedBackend];
      fallbackList.forEach(fb => {
        if (!result.some(r => r.slug === fb.slug || r.id === fb.id)) {
          const isEnrolled = enrolledCourseIds.includes(fb.id);
          result.push({ ...fb, isEnrolled });
        }
      });

      return result.slice(0, 2);
    };

    const step1Courses = getStepCourses(1);
    const step2Courses = getStepCourses(2);
    const step3Courses = getStepCourses(3);
    const step4Courses = getStepCourses(4);

    // Build Step Statuses
    const step1Enrolled = step1Courses.some(c => c.isEnrolled);
    const step2Enrolled = step2Courses.some(c => c.isEnrolled);
    const step3Enrolled = step3Courses.some(c => c.isEnrolled);
    const step4Enrolled = step4Courses.some(c => c.isEnrolled);

    const steps: RoadmapMilestoneStep[] = [
      {
        id: 1,
        title: `Nền tảng ${tpl.title} & Cơ bản`,
        subtitle: 'Kiến thức nền tảng, công cụ phát triển & tư duy hệ thống',
        description: `Bắt đầu hành trình với các khái niệm căn bản của ${tpl.title}, thiết lập môi trường phát triển chuyên nghiệp và chuẩn mực mã nguồn.`,
        status: step1Enrolled ? 'completed' : 'in-progress',
        duration: '4 Tuần',
        estimatedHours: '40 Giờ',
        concepts: ['Môi trường phát triển & IDE', 'Git/GitHub Version Control', 'Tư duy lập trình chuẩn mực', 'Kiến trúc ứng dụng cơ bản'],
        projectTitle: `🏆 Project Chặng 1: Xây dựng ứng dụng nền tảng chuẩn mực cho ${tpl.title}`,
        videoUrl: step1Courses[0]?.videoUrl || SAMPLE_VIDEOS[0],
        videoTitle: `Video Hướng dẫn Chặng 1: Tổng quan Nền tảng ${tpl.title}`,
        videoDuration: '15:30',
        courses: step1Courses
      },
      {
        id: 2,
        title: 'Kỹ năng Cốt lõi & Kiến trúc Chuyên sâu',
        subtitle: 'Làm chủ các framework & công nghệ trọng tâm',
        description: `Đi sâu vào việc làm chủ các thư viện, framework tiên tiến và quy trình xử lý dữ liệu thực tế cho ${tpl.title}.`,
        status: step2Enrolled ? 'completed' : (step1Enrolled ? 'in-progress' : 'locked'),
        duration: '6 Tuần',
        estimatedHours: '60 Giờ',
        concepts: ['Framework Core & State Management', 'RESTful API & Integration', 'Authentication & Authorization', 'Performance Optimization'],
        projectTitle: `🏆 Project Chặng 2: Xây dựng hệ thống ứng dụng quy mô vừa cho doanh nghiệp`,
        videoUrl: step2Courses[0]?.videoUrl || SAMPLE_VIDEOS[1],
        videoTitle: `Video Hướng dẫn Chặng 2: Frameworks & Xây dựng RESTful API`,
        videoDuration: '18:45',
        courses: step2Courses
      },
      {
        id: 3,
        title: 'Thực chiến Dự án & Tối ưu Nâng cao',
        subtitle: 'Dự án thực tế quy mô lớn, Security & Microservices',
        description: 'Thực hành dự án thực tế với kiến trúc hiện đại, xử lý tải cao, bảo mật thông tin và thử nghiệm quy trình làm việc Agile.',
        status: step3Enrolled ? 'completed' : (step2Enrolled ? 'in-progress' : 'locked'),
        duration: '8 Tuần',
        estimatedHours: '80 Giờ',
        concepts: ['Database Scaling & Caching', 'Automated Testing (Unit/Integration)', 'Bảo mật web & OWASP Top 10', 'System Architecture Design'],
        projectTitle: `🏆 Project Chặng 3: Sản phẩm hoàn chỉnh sẵn sàng đưa vào Production`,
        videoUrl: step3Courses[0]?.videoUrl || SAMPLE_VIDEOS[2],
        videoTitle: `Video Hướng dẫn Chặng 3: Thiết kế Hệ thống & Microservices`,
        videoDuration: '22:10',
        courses: step3Courses
      },
      {
        id: 4,
        title: 'Triển khai Production, DevOps & Chuyên gia',
        subtitle: 'CI/CD, Monitoring, Cloud Deployment & Career Preparation',
        description: 'Hoàn thiện quy trình tự động hóa triển khai ứng dụng lên Cloud, tối ưu hóa chi phí vận hành và chuẩn bị bộ hồ sơ xin việc ấn tượng.',
        status: step4Enrolled ? 'completed' : (step3Enrolled ? 'in-progress' : 'locked'),
        duration: '6 Tuần',
        estimatedHours: '60 Giờ',
        concepts: ['Docker Containerization', 'CI/CD Pipeline with GitHub Actions', 'Cloud Deployment (AWS/Vercel/DigitalOcean)', 'CV Review & Tech Interview Prep'],
        projectTitle: `🏆 Project Capstone: Đồ án tốt nghiệp và phỏng vấn thử nghiệm cùng Tech Lead`,
        videoUrl: step4Courses[0]?.videoUrl || SAMPLE_VIDEOS[3],
        videoTitle: `Video Hướng dẫn Chặng 4: Tự động hóa CI/CD & Deploy Cloud`,
        videoDuration: '16:50',
        courses: step4Courses
      }
    ];

    // Calculate total hours and months based on actual courses found across all steps
    const allStepCourses = [...step1Courses, ...step2Courses, ...step3Courses, ...step4Courses];
    const totalHoursNum = allStepCourses.reduce((acc, c) => acc + 25, 120);
    const totalMonthsNum = Math.ceil(totalHoursNum / 40);

    return {
      id: key,
      title: tpl.title,
      subtitle: `Lộ trình đào tạo toàn diện từ số 0 đến Kỹ sư ${tpl.title} Chuyên nghiệp`,
      description: tpl.description,
      category: tpl.categoryLabel,
      badge: tpl.badge,
      totalCourses: allStepCourses.length > 0 ? allStepCourses.length : 8,
      totalMonths: `${totalMonthsNum} Tháng`,
      totalHours: `${totalHoursNum} Giờ học`,
      avgSalary: tpl.salary,
      hiringDemand: tpl.demand,
      skills: tpl.skills,
      gradientTheme: tpl.gradientTheme,
      accentBg: tpl.accentBg,
      textColor: tpl.textColor,
      steps
    };
  },

  /**
   * Fetch personalized next learning path from backend for logged in learner
   */
  async getNextLearningPath(): Promise<any> {
    devLog('Roadmaps', 'Fetching personalized recommended learning path');
    try {
      const res = await apiFetch<any>('/me/learning-path/next');
      return res?.data || res;
    } catch (err) {
      console.warn('Learning path API not accessible or unauthenticated:', err);
      return null;
    }
  }
};

