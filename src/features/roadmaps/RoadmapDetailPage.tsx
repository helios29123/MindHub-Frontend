import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { 
  ArrowLeft, CheckCircle2, Circle, Lock, PlayCircle, Clock, BookOpen, 
  Sparkles, Award, ChevronRight, Code, Server, Database, Smartphone, 
  Layers, Cloud, Zap, Briefcase, Share2, FileText, CheckSquare, Trophy
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { CourseCard } from '@/features/courses/components/CourseCard';

interface MilestoneStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked';
  duration: string;
  estimatedHours: string;
  concepts: string[];
  projectTitle?: string;
  courses: Array<{
    id: string;
    slug?: string;
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
  }>;
}

interface RoadmapData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
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
  steps: MilestoneStep[];
}

const ALL_ROADMAPS_DATA: Record<string, RoadmapData> = {
  frontend: {
    id: "frontend",
    title: "Frontend Developer",
    subtitle: "Lộ trình đào tạo toàn diện từ số 0 đến Kỹ sư Frontend Chuyên nghiệp",
    description: "Chinh phục nấc thang nghề nghiệp với kiến thức chuẩn mực về Web Standards, JavaScript ES6+, ReactJS ecosystem, TypeScript, Next.js và tối ưu hiệu năng ứng dụng quy mô lớn.",
    icon: <Code className="w-8 h-8 text-blue-500" />,
    category: "Web Development",
    badge: "Lộ trình phổ biến nhất",
    totalCourses: 12,
    totalMonths: "6 Tháng",
    totalHours: "240 Giờ học",
    avgSalary: "15 - 35 Triệu/tháng",
    hiringDemand: "Rất cao (🔥 Hot)",
    skills: ["HTML5/CSS3", "JavaScript ES6+", "TypeScript", "ReactJS", "Next.js 14", "Tailwind CSS", "Redux Toolkit", "Web Performance"],
    gradientTheme: "from-blue-600 via-indigo-600 to-sky-700",
    accentBg: "bg-blue-500/10 border-blue-200 text-blue-600 dark:text-blue-400",
    textColor: "text-blue-600 dark:text-blue-400",
    steps: [
      {
        id: 1,
        title: "Nền tảng Web & Internet Basics",
        subtitle: "Tổng quan kiến trúc Web, HTTP Protocol, DNS & Terminal",
        description: "Nắm vững cách trình duyệt tương tác với server, cách request/response vận hành và sử dụng thành thạo Git/GitHub cho quản lý mã nguồn.",
        status: "completed",
        duration: "3 Tuần",
        estimatedHours: "30 Giờ",
        concepts: ["HTTP/HTTPS Protocol", "DNS & Web Hosting", "Command Line & Git Basics", "Chrome DevTools Master"],
        courses: []
      },
      {
        id: 2,
        title: "HTML5, CSS3 Modern & Responsive Design",
        subtitle: "Xây dựng giao diện chuẩn W3C, Flexbox, Grid & Animation",
        description: "Thiết kế giao diện người dùng đáp ứng mọi kích thước màn hình (Mobile, Tablet, Desktop) với CSS Grid, Flexbox và Tailwind CSS.",
        status: "in-progress",
        duration: "4 Tuần",
        estimatedHours: "45 Giờ",
        concepts: ["Semantic HTML5", "CSS Flexbox & Grid System", "Tailwind CSS Utility First", "BEM Methodology & SCSS"],
        projectTitle: "🏆 Project chặng 2: Xây dựng Landing Page Thương mại Điện tử Responsive chuẩn SEO",
        courses: [
          {
            id: "laravel-rest-api-tu-co-ban-den-trien-khai",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Lập trình React JS & Backend REST API Chuyên nghiệp",
            instructor: "Nguyễn Minh Khoa",
            price: 499000,
            salePrice: 299000,
            rating: 4.9,
            reviewCount: 380,
            enrolledCount: 2150,
            thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
            tags: ["React", "TypeScript", "REST API"],
            level: "Intermediate"
          }
        ]
      },
      {
        id: 3,
        title: "JavaScript Lõi & Lập trình Bất đồng bộ (ES6+)",
        subtitle: "Nâng cao tư duy thuật toán, Closure, Async/Await & Event Loop",
        description: "Làm chủ ngôn ngữ lập trình phổ biến nhất thế giới. Hiểu rõ Closure, Prototype, Promise, Async/Await và DOM Manipulation.",
        status: "locked",
        duration: "5 Tuần",
        estimatedHours: "50 Giờ",
        concepts: ["ES6+ Syntax & Features", "Promises & Async/Await", "DOM & Browser Events", "LocalStorage & SessionStorage"],
        projectTitle: "🏆 Project chặng 3: Ứng dụng Quản lý Công việc (Task Flow Board) kết hợp LocalStorage",
        courses: []
      },
      {
        id: 4,
        title: "ReactJS Ecosystem & State Management",
        subtitle: "Component Architecture, Hooks, Context API & Redux Toolkit",
        description: "Xây dựng Single Page Application (SPA) chuyên nghiệp với React 18, React Router v6 và quản lý state phức tạp với Redux Toolkit.",
        status: "locked",
        duration: "6 Tuần",
        estimatedHours: "65 Giờ",
        concepts: ["React Components & Props", "React Custom Hooks", "React Router DOM v6", "Redux Toolkit & RTK Query"],
        courses: []
      },
      {
        id: 5,
        title: "Next.js Fullstack Framework & Production Deployment",
        subtitle: "App Router, Server Components, SSR/SSG & Vercel Deployment",
        description: "Đưa ứng dụng React lên quy mô lớn với Server Side Rendering, SEO optimization, Authentication OAuth và CI/CD deployment.",
        status: "locked",
        duration: "6 Tuần",
        estimatedHours: "50 Giờ",
        concepts: ["Next.js 14 App Router", "Server Side Rendering (SSR)", "NextAuth.js OAuth 2.0", "Performance Audit & Vercel"],
        projectTitle: "🏆 Graduation Capstone: Hệ thống Nền tảng Học trực tuyến LMS hoàn chỉnh",
        courses: []
      }
    ]
  },
  backend: {
    id: "backend",
    title: "Backend Developer",
    subtitle: "Lộ trình đào tạo Kỹ sư Backend & Kiến trúc Hệ thống Phân tán",
    description: "Làm chủ công nghệ Backend với Node.js, Laravel, Java Spring Boot, quản trị cơ sở dữ liệu quan hệ & NoSQL, thiết kế RESTful API và Microservices.",
    icon: <Server className="w-8 h-8 text-emerald-500" />,
    category: "Web Development",
    badge: "Hot Career",
    totalCourses: 15,
    totalMonths: "8 Tháng",
    totalHours: "320 Giờ học",
    avgSalary: "18 - 40 Triệu/tháng",
    hiringDemand: "Rất cao (🔥 Hot)",
    skills: ["Node.js", "Laravel", "PostgreSQL", "Redis", "Docker", "Microservices", "System Design"],
    gradientTheme: "from-emerald-600 via-teal-600 to-cyan-700",
    accentBg: "bg-emerald-500/10 border-emerald-200 text-emerald-600 dark:text-emerald-400",
    textColor: "text-emerald-600 dark:text-emerald-400",
    steps: [
      {
        id: 1,
        title: "Cơ sở Dữ liệu & Thiết kế Database",
        subtitle: "SQL, PostgreSQL, MySQL, Normalization & Indexing",
        description: "Học cách thiết kế cơ sở dữ liệu quan hệ chuẩn hóa 3NF, tối ưu hóa truy vấn SQL và tạo Indexes cho bảng dữ liệu lớn.",
        status: "completed",
        duration: "4 Tuần",
        estimatedHours: "40 Giờ",
        concepts: ["SQL Querying & Joins", "Database Normalization", "Indexing & Query Optimization", "PostgreSQL Transactions"],
        courses: []
      },
      {
        id: 2,
        title: "RESTful API Development & Architecture",
        subtitle: "Laravel Framework, Repository Pattern, Authentication JWT",
        description: "Xây dựng hệ thống API chuẩn hóa RESTful với Laravel 11, Service/Repository pattern và bảo mật API Token Sanctum.",
        status: "in-progress",
        duration: "6 Tuần",
        estimatedHours: "60 Giờ",
        concepts: ["Laravel Eloquent ORM", "Repository & Service Pattern", "JWT & Sanctum Authentication", "Pest PHP Testing"],
        projectTitle: "🏆 Project chặng 2: Hệ thống REST API Quản lý Bán hàng đa kênh tích hợp SePay & VNPAY",
        courses: [
          {
            id: "laravel-rest-api-tu-co-ban-den-trien-khai",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Lập trình React JS & Backend REST API Chuyên nghiệp",
            instructor: "Nguyễn Minh Khoa",
            price: 499000,
            salePrice: 299000,
            rating: 4.9,
            reviewCount: 380,
            enrolledCount: 2150,
            thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
            tags: ["Laravel", "REST API", "PostgreSQL"],
            level: "Intermediate"
          }
        ]
      },
      {
        id: 3,
        title: "Caching, Queue & Asynchronous Processing",
        subtitle: "Redis Caching, RabbitMQ & Background Job Queues",
        description: "Tối ưu tốc độ phản hồi API bằng Redis Cache và xử lý công việc bất đồng bộ với Queue Jobs, Worker Processes.",
        status: "locked",
        duration: "5 Tuần",
        estimatedHours: "50 Giờ",
        concepts: ["Redis In-Memory Caching", "Laravel Queue & Horizon", "RabbitMQ Message Broker", "Rate Limiting & Throttling"],
        courses: []
      },
      {
        id: 4,
        title: "Containerization & Cloud Infrastructure",
        subtitle: "Docker, Docker Compose & Deploy AWS EC2",
        description: "Đóng gói ứng dụng backend thành các container với Docker và triển khai lên hạ tầng cloud đám mây AWS.",
        status: "locked",
        duration: "5 Tuần",
        estimatedHours: "50 Giờ",
        concepts: ["Docker & Multi-stage Build", "Docker Compose Environment", "AWS EC2 & Nginx Reverse Proxy", "SSL/TLS Security"],
        courses: []
      },
      {
        id: 5,
        title: "Microservices Architecture & System Design",
        subtitle: "Event-driven Architecture, API Gateway & Scalability",
        description: "Thiết kế kiến trúc hệ thống phục vụ hàng triệu người dùng đồng thời (High Concurrency & Availability).",
        status: "locked",
        duration: "6 Tuần",
        estimatedHours: "60 Giờ",
        concepts: ["API Gateway Design", "Event-driven Microservices", "Database Sharding & Replication", "System Design Interview Mastery"],
        projectTitle: "🏆 Graduation Capstone: Kiến trúc Microservices Hệ thống E-commerce chịu tải cao",
        courses: []
      }
    ]
  }
};

export default function RoadmapDetailPage() {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const navigate = useNavigate();
  
  // Resolve roadmap data or fallback to frontend
  const roadmapKey = (roadmapId && ALL_ROADMAPS_DATA[roadmapId]) ? roadmapId : 'frontend';
  const roadmap = ALL_ROADMAPS_DATA[roadmapKey];

  const [activeStepId, setActiveStepId] = useState<number>(
    roadmap.steps.find(s => s.status === 'in-progress')?.id || 1
  );

  // Compute overall progress stats
  const completedStepsCount = roadmap.steps.filter(s => s.status === 'completed').length;
  const progressPercent = Math.round((completedStepsCount / roadmap.steps.length) * 100);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Top Navigation Bar */}
        <div className="bg-card border-b border-border/50 py-3.5 px-4 sm:px-6 sticky top-0 z-30 backdrop-blur-md bg-card/90">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link 
              to="/roadmaps" 
              className="inline-flex items-center text-xs sm:text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tất cả lộ trình
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
                Tiến độ lộ trình: <strong className="text-foreground">{progressPercent}%</strong>
              </span>
              <div className="w-24 sm:w-36 h-2 bg-muted rounded-full overflow-hidden border border-border/50">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-primary transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Hero Banner with Color Gradient */}
        <section className={`relative overflow-hidden bg-gradient-to-r ${roadmap.gradientTheme} text-white py-12 md:py-16 px-4 sm:px-6 shadow-xl`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>{roadmap.badge}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  {roadmap.title}
                </h1>

                <p className="text-white/90 text-sm sm:text-base leading-relaxed font-normal">
                  {roadmap.description}
                </p>

                {/* Skills Pill List */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {roadmap.skills.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-white/95"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Header Meta Overview Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 lg:w-80 shrink-0 text-white space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-white/15 text-xs">
                  <span className="text-white/80 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-300" /> Tổng số khóa học:
                  </span>
                  <span className="font-black text-sm">{roadmap.totalCourses} Khóa</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-white/15 text-xs">
                  <span className="text-white/80 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-300" /> Thời gian học:
                  </span>
                  <span className="font-black text-sm">{roadmap.totalMonths}</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-white/15 text-xs">
                  <span className="text-white/80 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-sky-300" /> Lương kỳ vọng:
                  </span>
                  <span className="font-black text-xs">{roadmap.avgSalary}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-300" /> Tuyển dụng:
                  </span>
                  <span className="font-black text-xs text-amber-300">{roadmap.hiringDemand}</span>
                </div>

                <Button 
                  onClick={() => {
                    const stepEl = document.getElementById(`milestone-step-${activeStepId}`);
                    if (stepEl) stepEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full bg-white text-slate-900 hover:bg-white/90 font-bold rounded-xl h-11 text-xs gap-2 shadow-md mt-2"
                >
                  <PlayCircle className="w-4 h-4 text-primary" />
                  Tiếp tục chặng hiện tại
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Layout: Milestones List + Sticky Nav */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Main Area: Milestone Cards (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Map className="w-6 h-6 text-primary" />
                  Các chặng hành trình học tập ({roadmap.steps.length} Chặng)
                </h2>
                <span className="text-xs font-semibold text-muted-foreground">
                  Hoàn thành {completedStepsCount}/{roadmap.steps.length} chặng
                </span>
              </div>

              {roadmap.steps.map((step, index) => {
                const isCompleted = step.status === 'completed';
                const isInProgress = step.status === 'in-progress';
                const isLocked = step.status === 'locked';

                return (
                  <div
                    key={step.id}
                    id={`milestone-step-${step.id}`}
                    className={`relative bg-card rounded-3xl border transition-all duration-300 p-6 sm:p-8 ${
                      isInProgress 
                        ? 'border-primary shadow-xl ring-2 ring-primary/20' 
                        : isCompleted
                        ? 'border-emerald-500/40 bg-card'
                        : 'border-border/60 opacity-90'
                    }`}
                  >
                    {/* Header Row inside Step Card */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isInProgress
                            ? 'bg-primary text-primary-foreground animate-pulse'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                              CHẶNG {index + 1}
                            </span>
                            {isCompleted && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                ✓ Đã hoàn thành
                              </span>
                            )}
                            {isInProgress && (
                              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold border border-primary/20 animate-pulse">
                                ⚡ Đang học
                              </span>
                            )}
                            {isLocked && (
                              <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Khóa tiếp theo
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                            {step.title}
                          </h3>
                        </div>
                      </div>

                      <div className="text-right text-xs font-semibold text-muted-foreground shrink-0 hidden sm:block">
                        <span className="block text-foreground font-bold">{step.duration}</span>
                        <span>{step.estimatedHours}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* Key Concepts Checklist */}
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border/40 mb-6 space-y-2">
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-primary" /> Kiến thức & Kỹ năng cốt lõi:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {step.concepts.map((concept, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span>{concept}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Project Milestone Highlight if present */}
                    {step.projectTitle && (
                      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 p-4 rounded-2xl mb-6 text-xs text-amber-950 dark:text-amber-200">
                        <p className="font-bold flex items-center gap-2 text-amber-800 dark:text-amber-300">
                          {step.projectTitle}
                        </p>
                      </div>
                    )}

                    {/* Recommended Courses Section */}
                    {step.courses.length > 0 && (
                      <div className="pt-4 border-t border-border/50">
                        <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          Khóa học cốt lõi cần hoàn thành:
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          {step.courses.map(course => (
                            <CourseCard key={course.id} course={course as any} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Area: Sticky Table of Contents & Support Widget (4 cols) */}
            <div className="lg:col-span-4 space-y-6 sticky top-20">
              {/* Table of Contents Card */}
              <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Mục lục chặng học tập
                </h3>

                <div className="space-y-2">
                  {roadmap.steps.map((step, index) => {
                    const isCompleted = step.status === 'completed';
                    const isInProgress = step.status === 'in-progress';

                    return (
                      <button
                        key={step.id}
                        onClick={() => {
                          setActiveStepId(step.id);
                          const stepEl = document.getElementById(`milestone-step-${step.id}`);
                          if (stepEl) stepEl.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-full text-left p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                          activeStepId === step.id
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : isInProgress ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 animate-pulse" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                          )}
                          <span className="truncate">Chặng {index + 1}: {step.title}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mentor Support Widget */}
              <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">Cần tham vấn định hướng 1-1?</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Đội ngũ kĩ sư MindHub sẵn sàng giải đáp thắc mắc và kiểm tra bài tập cho bạn suốt lộ trình.
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/contact')} className="w-full rounded-xl text-xs font-bold">
                  Kết nối Mentor ngay
                </Button>
              </div>
            </div>

          </div>
        </section>
      </div>
    </PageTransition>
  );
}
