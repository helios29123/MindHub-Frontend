import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { 
  Map as MapIcon, ArrowLeft, CheckCircle2, Circle, Lock, PlayCircle, Clock, BookOpen, 
  Sparkles, Award, ChevronRight, Code, Server, Database, Smartphone, 
  Layers, Cloud, Zap, Briefcase, Share2, FileText, CheckSquare, Trophy
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { CourseCard, CourseData } from '@/features/courses/components/CourseCard';
import { roadmapsApi } from './api';

interface MilestoneStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked';
  duration: string;
  estimatedHours: string;
  concepts?: string[];
  projectTitle?: string;
  courses?: Array<{
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
        courses: [
          {
            id: "web-fundamentals-html-css",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Xây dựng Website Đầu tiên với HTML5, CSS3 Modern & Git",
            instructor: "Trần Hoàng Nam",
            price: 399000,
            salePrice: 199000,
            rating: 4.8,
            reviewCount: 240,
            enrolledCount: 1450,
            thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
            tags: ["HTML", "CSS", "Git"],
            level: "Beginner"
          }
        ]
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
        courses: [
          {
            id: "javascript-advanced-es6-async",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Master JavaScript ES6+ & Lập trình Bất đồng bộ Thực chiến",
            instructor: "Lê Hoàng Bảo",
            price: 599000,
            salePrice: 349000,
            rating: 4.9,
            reviewCount: 420,
            enrolledCount: 1890,
            thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80",
            tags: ["JavaScript", "ES6+", "Async"],
            level: "Intermediate"
          }
        ]
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
        courses: [
          {
            id: "react-18-redux-toolkit-mastery",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Chinh phục React 18, Redux Toolkit & Custom Hooks",
            instructor: "Nguyễn Minh Khoa",
            price: 699000,
            salePrice: 399000,
            rating: 4.9,
            reviewCount: 510,
            enrolledCount: 2680,
            thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
            tags: ["React 18", "Redux", "Hooks"],
            level: "Intermediate"
          }
        ]
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
        courses: [
          {
            id: "nextjs-14-app-router-fullstack",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Lập trình Next.js 14 App Router & Triển khai Production",
            instructor: "Phạm Thành Nam",
            price: 799000,
            salePrice: 499000,
            rating: 5.0,
            reviewCount: 310,
            enrolledCount: 1540,
            thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
            tags: ["Next.js", "SSR", "Vercel"],
            level: "Advanced"
          }
        ]
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
        courses: [
          {
            id: "database-design-postgresql-sql",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Thiết kế Cơ sở Dữ liệu & Tối ưu SQL PostgreSQL",
            instructor: "Vũ Hải Đăng",
            price: 499000,
            salePrice: 299000,
            rating: 4.8,
            reviewCount: 310,
            enrolledCount: 1650,
            thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
            tags: ["Database", "PostgreSQL", "SQL"],
            level: "Beginner"
          }
        ]
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
        courses: [
          {
            id: "redis-rabbitmq-microservices-caching",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Lập trình Redis Cache, RabbitMQ & Microservices Queue",
            instructor: "Đặng Tuấn Anh",
            price: 599000,
            salePrice: 399000,
            rating: 4.9,
            reviewCount: 280,
            enrolledCount: 1420,
            thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
            tags: ["Redis", "RabbitMQ", "Queue"],
            level: "Intermediate"
          }
        ]
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
        courses: [
          {
            id: "docker-kubernetes-aws-deployment",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Docker, Kubernetes & Triển khai Đám mây AWS EC2",
            instructor: "Hoàng Văn Đức",
            price: 699000,
            salePrice: 449000,
            rating: 4.9,
            reviewCount: 390,
            enrolledCount: 1980,
            thumbnail: "https://images.unsplash.com/photo-1667372335854-c522b045683a?w=800&q=80",
            tags: ["Docker", "AWS", "DevOps"],
            level: "Advanced"
          }
        ]
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
        courses: [
          {
            id: "system-design-microservices-architecture",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Thiết kế Kiến trúc Hệ thống Microservices & High Availability",
            instructor: "Trần Anh Dũng",
            price: 899000,
            salePrice: 599000,
            rating: 5.0,
            reviewCount: 450,
            enrolledCount: 2210,
            thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
            tags: ["System Design", "Microservices", "Scalability"],
            level: "Advanced"
          }
        ]
      }
    ]
  },
  fullstack: {
    id: "fullstack",
    title: "Fullstack Engineer",
    subtitle: "Lộ trình đào tạo Kỹ sư Phần mềm Fullstack Chuyên nghiệp",
    description: "Chinh phục cả Frontend và Backend, thiết kế toàn diện hệ thống ứng dụng Web hiện đại với Next.js, Node.js, Laravel và Docker.",
    icon: <Layers className="w-8 h-8 text-indigo-500" />,
    category: "Fullstack",
    badge: "Được săn đón",
    totalCourses: 20,
    totalMonths: "10 Tháng",
    totalHours: "400 Giờ học",
    avgSalary: "20 - 45 Triệu/tháng",
    hiringDemand: "Đột phá (🚀 Peak)",
    skills: ["React", "Node.js", "TypeScript", "Laravel", "PostgreSQL", "Docker", "AWS"],
    gradientTheme: "from-indigo-600 via-purple-600 to-pink-700",
    accentBg: "bg-indigo-500/10 border-indigo-200 text-indigo-600 dark:text-indigo-400",
    textColor: "text-indigo-600 dark:text-indigo-400",
    steps: [
      {
        id: 1,
        title: "Fullstack Fundamentals & Database Design",
        subtitle: "HTML/CSS, JS ES6+ & PostgreSQL Database",
        description: "Làm chủ nền tảng lập trình web và thiết kế cơ sở dữ liệu quan hệ.",
        status: "completed",
        duration: "4 Tuần",
        estimatedHours: "45 Giờ",
        concepts: ["Web Basics", "ES6+ JavaScript", "SQL Queries", "Database Design"],
        courses: [
          {
            id: "fullstack-basics-db-design",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Nền tảng Fullstack Web Development 2026",
            instructor: "Trần Hoàng Nam",
            price: 399000,
            salePrice: 199000,
            rating: 4.8,
            reviewCount: 290,
            enrolledCount: 1560,
            thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
            tags: ["Fullstack", "Web", "DB"],
            level: "Beginner"
          }
        ]
      },
      {
        id: 2,
        title: "Frontend Mastery with React & TypeScript",
        subtitle: "React Hooks, TypeScript Types & State Management",
        description: "Xây dựng giao diện mượt mà type-safe với ReactJS & TypeScript.",
        status: "in-progress",
        duration: "6 Tuần",
        estimatedHours: "60 Giờ",
        projectTitle: "🏆 Project chặng 2: Website Đặt vé Máy bay trực tuyến chuẩn Responsive",
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
            tags: ["Fullstack", "React", "Node.js"],
            level: "Intermediate"
          }
        ]
      },
      {
        id: 3,
        title: "Backend API Engineering with Node.js & Laravel",
        subtitle: "Express.js, Laravel REST API & Authentication",
        description: "Viết RESTful API bảo mật và kết nối mượt mà với ứng dụng Frontend.",
        status: "locked",
        duration: "6 Tuần",
        estimatedHours: "65 Giờ",
        concepts: ["Express.js Server", "Laravel Framework", "Sanctum Auth", "Postgres Migration"],
        courses: [
          {
            id: "fullstack-nextjs-laravel-architecture",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Lập trình Next.js 14 & Laravel RESTful Fullstack Architecture",
            instructor: "Phạm Thành Nam",
            price: 799000,
            salePrice: 499000,
            rating: 4.9,
            reviewCount: 410,
            enrolledCount: 1980,
            thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
            tags: ["Next.js", "Laravel", "Fullstack"],
            level: "Advanced"
          }
        ]
      }
    ]
  },
  data: {
    id: "data",
    title: "Data Engineering & AI",
    subtitle: "Lộ trình Kỹ sư Dữ liệu & Tích hợp Trí tuệ Nhân tạo AI",
    description: "Xử lý dữ liệu lớn, làm chủ Data Pipeline, Python, SQL, Spark & Tích hợp mô hình AI / LLM vào doanh nghiệp.",
    icon: <Database className="w-8 h-8 text-purple-500" />,
    category: "Data & AI",
    badge: "Xu hướng 2026",
    totalCourses: 11,
    totalMonths: "6 Tháng",
    totalHours: "250 Giờ học",
    avgSalary: "22 - 50 Triệu/tháng",
    hiringDemand: "Tăng trưởng nóng",
    skills: ["Python", "SQL", "PySpark", "Kafka", "Data Warehouse", "LLM Integration"],
    gradientTheme: "from-purple-600 via-fuchsia-600 to-pink-700",
    accentBg: "bg-purple-500/10 border-purple-200 text-purple-600 dark:text-purple-400",
    textColor: "text-purple-600 dark:text-purple-400",
    steps: [
      {
        id: 1,
        title: "Python for Data & SQL Mastery",
        subtitle: "Python Syntax, Data Structures & Advanced SQL",
        description: "Làm chủ Python cho xử lý dữ liệu và viết các truy vấn SQL phức tạp.",
        status: "completed",
        duration: "4 Tuần",
        estimatedHours: "40 Giờ",
        concepts: ["Python Basics", "Pandas & NumPy", "SQL Window Functions", "Data Cleaning"],
        courses: [
          {
            id: "python-data-analysis-sql",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Python for Data Analytics & Advanced SQL Queries",
            instructor: "Đỗ Thanh Hằng",
            price: 499000,
            salePrice: 299000,
            rating: 4.8,
            reviewCount: 320,
            enrolledCount: 1780,
            thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
            tags: ["Python", "Data", "SQL"],
            level: "Beginner"
          }
        ]
      },
      {
        id: 2,
        title: "Data Pipeline & ETL Engineering",
        subtitle: "Airflow, Kafka & Data Warehousing",
        description: "Xây dựng các luồng thu thập và xử lý dữ liệu tự động cho doanh nghiệp.",
        status: "in-progress",
        duration: "6 Tuần",
        estimatedHours: "60 Giờ",
        projectTitle: "🏆 Project chặng 2: Hệ thống ETL Pipeline Phân tích Hành vi Người dùng",
        courses: [
          {
            id: "data-pipeline-airflow-pyspark",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Xây dựng Data Pipeline với Apache Airflow & PySpark",
            instructor: "Nguyễn Quốc Bảo",
            price: 699000,
            salePrice: 449000,
            rating: 4.9,
            reviewCount: 290,
            enrolledCount: 1430,
            thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
            tags: ["Data Pipeline", "Airflow", "PySpark"],
            level: "Intermediate"
          }
        ]
      }
    ]
  },
  mobile: {
    id: "mobile",
    title: "Mobile App Developer",
    subtitle: "Lộ trình Phát triển Ứng dụng Di động Đa nền tảng",
    description: "Xây dựng ứng dụng di động iOS & Android đa nền tảng mượt mà với React Native và Flutter.",
    icon: <Smartphone className="w-8 h-8 text-amber-500" />,
    category: "Mobile Dev",
    badge: "Xu hướng Mobile",
    totalCourses: 9,
    totalMonths: "5 Tháng",
    totalHours: "200 Giờ học",
    avgSalary: "16 - 35 Triệu/tháng",
    hiringDemand: "Cao",
    skills: ["Flutter", "Dart", "React Native", "Swift/Kotlin", "Firebase", "App Store/Play"],
    gradientTheme: "from-amber-600 via-orange-600 to-red-700",
    accentBg: "bg-amber-500/10 border-amber-200 text-amber-600 dark:text-amber-400",
    textColor: "text-amber-600 dark:text-amber-400",
    steps: [
      {
        id: 1,
        title: "Mobile UI Design & Cross-Platform Fundamentals",
        subtitle: "Dart Language & Flutter Layout System",
        description: "Nắm vững ngôn ngữ Dart và thiết kế giao diện ứng dụng di động chuẩn UX.",
        status: "completed",
        duration: "4 Tuần",
        estimatedHours: "40 Giờ",
        concepts: ["Dart Fundamentals", "Flutter Widgets", "Responsive Mobile Layout", "Stateful Widget"],
        courses: [
          {
            id: "flutter-dart-mobile-development",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Lập trình Flutter & Dart từ Cơ bản đến Nâng cao",
            instructor: "Bùi Tiến Đạt",
            price: 499000,
            salePrice: 299000,
            rating: 4.8,
            reviewCount: 340,
            enrolledCount: 1620,
            thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
            tags: ["Flutter", "Dart", "Mobile"],
            level: "Beginner"
          }
        ]
      },
      {
        id: 2,
        title: "State Management & Firebase Integration",
        subtitle: "Provider, BLoC Pattern & Firebase Services",
        description: "Kết nối ứng dụng di động với hệ thống Backend & Firebase.",
        status: "in-progress",
        duration: "5 Tuần",
        estimatedHours: "50 Giờ",
        projectTitle: "🏆 Project chặng 2: App Đặt Đồ ăn trực tuyến chuẩn mượt",
        courses: [
          {
            id: "react-native-firebase-integration",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Lập trình React Native & Tích hợp Firebase Cloud",
            instructor: "Nguyễn Đức Anh",
            price: 599000,
            salePrice: 349000,
            rating: 4.9,
            reviewCount: 290,
            enrolledCount: 1510,
            thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80",
            tags: ["React Native", "Firebase", "Mobile"],
            level: "Intermediate"
          }
        ]
      }
    ]
  },
  devops: {
    id: "devops",
    title: "DevOps & Cloud Engineer",
    subtitle: "Lộ trình Kỹ sư DevOps & Quản trị Hạ tầng Điện toán Đám mây",
    description: "Tự động hóa triển khai, quản trị hạ tầng điện toán đám mây với Docker, Kubernetes, CI/CD & AWS.",
    icon: <Cloud className="w-8 h-8 text-sky-500" />,
    category: "DevOps & Cloud",
    badge: "Đội ngũ hạ tầng",
    totalCourses: 10,
    totalMonths: "6 Tháng",
    totalHours: "240 Giờ học",
    avgSalary: "25 - 55 Triệu/tháng",
    hiringDemand: "Rất cao",
    skills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD Pipeline", "Linux Admin"],
    gradientTheme: "from-sky-600 via-blue-600 to-indigo-700",
    accentBg: "bg-sky-500/10 border-sky-200 text-sky-600 dark:text-sky-400",
    textColor: "text-sky-600 dark:text-sky-400",
    steps: [
      {
        id: 1,
        title: "Linux System Administration & Networking",
        subtitle: "Linux Commands, Bash Scripting & Networking Fundamentals",
        description: "Làm chủ hệ điều hành Linux và hạ tầng mạng máy tính.",
        status: "completed",
        duration: "4 Tuần",
        estimatedHours: "40 Giờ",
        concepts: ["Linux Administration", "Bash Scripting", "TCP/IP & Subnetting", "Nginx Config"],
        courses: [
          {
            id: "linux-admin-networking-security",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "Quản trị Hệ thống Linux, Bash Scripting & Network Security",
            instructor: "Vũ Hải Đăng",
            price: 499000,
            salePrice: 299000,
            rating: 4.8,
            reviewCount: 310,
            enrolledCount: 1540,
            thumbnail: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80",
            tags: ["Linux", "Networking", "DevOps"],
            level: "Beginner"
          }
        ]
      },
      {
        id: 2,
        title: "Docker & Container Orchestration",
        subtitle: "Containerization, Docker Compose & Microservices Deployment",
        description: "Đóng gói ứng dụng thành container và quản lý hạ tầng triển khai.",
        status: "in-progress",
        duration: "5 Tuần",
        estimatedHours: "50 Giờ",
        projectTitle: "🏆 Project chặng 2: Hệ thống CI/CD Tự động hóa Deploy sản phẩm",
        courses: [
          {
            id: "devops-docker-cicd-aws",
            slug: "laravel-rest-api-tu-co-ban-den-trien-khai",
            title: "DevOps Thực chiến: Docker, CI/CD Pipeline & AWS Cloud",
            instructor: "Hoàng Văn Đức",
            price: 699000,
            salePrice: 449000,
            rating: 4.9,
            reviewCount: 420,
            enrolledCount: 2050,
            thumbnail: "https://images.unsplash.com/photo-1667372335854-c522b045683a?w=800&q=80",
            tags: ["DevOps", "Docker", "CI/CD"],
            level: "Intermediate"
          }
        ]
      }
    ]
  }
};

export default function RoadmapDetailPage() {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const navigate = useNavigate();
  
  // Safely resolve roadmap data or fallback to frontend
  const roadmapKey = (roadmapId && ALL_ROADMAPS_DATA[roadmapId]) ? roadmapId : 'frontend';
  const initialRoadmap = ALL_ROADMAPS_DATA[roadmapKey] || ALL_ROADMAPS_DATA.frontend;

  const [roadmap, setRoadmap] = useState<RoadmapData>(initialRoadmap);
  const [activeStepId, setActiveStepId] = useState<number>(1);

  // Sync active step & real backend courses when roadmap changes
  useEffect(() => {
    let isMounted = true;
    const currentBase = ALL_ROADMAPS_DATA[roadmapKey] || ALL_ROADMAPS_DATA.frontend;
    setRoadmap(currentBase);

    if (currentBase && currentBase.steps && currentBase.steps.length > 0) {
      const inProgress = currentBase.steps.find(s => s.status === 'in-progress');
      setActiveStepId(inProgress ? inProgress.id : currentBase.steps[0].id);
    }

    async function syncBackendCourses() {
      try {
        const { courses } = await roadmapsApi.getRoadmapDetail(roadmapKey);
        if (isMounted && Array.isArray(courses) && courses.length > 0) {
          setRoadmap(prev => ({
            ...prev,
            steps: prev.steps.map((st, idx) => {
              const slicedBackend = courses.slice(idx, idx + 2);
              if (slicedBackend.length === 0) return st;
              return {
                ...st,
                courses: slicedBackend.map((c: any) => ({
                  id: String(c.id),
                  slug: c.slug || String(c.id),
                  title: c.title || c.name || 'Khóa học thực chiến',
                  instructor: c.instructor?.name || c.instructor || 'Giảng viên MindHub',
                  price: c.price || 499000,
                  salePrice: c.sale_price || c.salePrice || 299000,
                  rating: c.rating || 4.9,
                  reviewCount: c.review_count || 320,
                  enrolledCount: c.enrolled_count || 1250,
                  thumbnail: c.thumbnail_url || c.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
                  tags: c.tags || ['MindHub', 'API'],
                  level: c.level || 'Intermediate'
                }))
              };
            })
          }));
        }
      } catch (err) {
        console.warn('Sync roadmap backend courses error:', err);
      }
    }

    syncBackendCourses();
    return () => { isMounted = false; };
  }, [roadmapKey]);

  if (!roadmap || !roadmap.steps) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Không tìm thấy lộ trình</h2>
        <p className="text-sm text-muted-foreground mb-6">Lộ trình bạn đang truy cập không tồn tại hoặc đang được cập nhật.</p>
        <Button onClick={() => navigate('/roadmaps')} className="rounded-xl font-bold">
          Quay lại danh sách lộ trình
        </Button>
      </div>
    );
  }

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
                  <MapIcon className="w-6 h-6 text-primary" />
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
                    {step.concepts && step.concepts.length > 0 && (
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
                    )}

                    {/* Project Milestone Highlight if present */}
                    {step.projectTitle && (
                      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 p-4 rounded-2xl mb-6 text-xs text-amber-950 dark:text-amber-200">
                        <p className="font-bold flex items-center gap-2 text-amber-800 dark:text-amber-300">
                          {step.projectTitle}
                        </p>
                      </div>
                    )}

                    {/* Recommended Courses Section */}
                    {step.courses && step.courses.length > 0 && (
                      <div className="pt-4 border-t border-border/50">
                        <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          Khóa học cốt lõi cần hoàn thành:
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          {step.courses.map(c => {
                            const mappedCourse: CourseData = {
                              id: String(c.id),
                              slug: c.slug || String(c.id),
                              title: c.title || 'Khoá học MindHub',
                              instructor: c.instructor || 'Giảng viên MindHub',
                              thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
                              duration: '20 giờ học',
                              difficulty: (c.level as any) || 'Intermediate',
                              price: c.price || 499000,
                              salePrice: c.salePrice || 299000,
                              status: 'not_enrolled'
                            };

                            return (
                              <CourseCard key={c.id} course={mappedCourse} />
                            );
                          })}
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
