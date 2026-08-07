import React, { useState, useEffect } from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { 
  Map, ArrowRight, Code, Server, Database, Smartphone, Cloud, Layers, 
  Sparkles, CheckCircle2, TrendingUp, Clock, BookOpen, Users, Award, 
  Search, Zap, Briefcase, ShieldCheck, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { roadmapsApi } from './api';

interface RoadmapItem {
  id: string;
  category: 'web' | 'mobile' | 'data' | 'cloud' | 'fullstack';
  categoryLabel: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  coursesCount: number;
  duration: string;
  level: string;
  badge?: string;
  salary: string;
  demand: string;
  skills: string[];
  gradient: string;
  borderHover: string;
  iconBg: string;
  textColor: string;
  studentsCount: number;
}

const ROADMAPS: RoadmapItem[] = [
  {
    id: "frontend",
    category: "web",
    categoryLabel: "Web Development",
    title: "Frontend Developer",
    description: "Trở thành kỹ sư Frontend chuyên nghiệp với React, Next.js, Vue 3 và thiết kế UI/UX hiện đại.",
    icon: <Code className="w-7 h-7 text-blue-600 dark:text-blue-400" />,
    coursesCount: 12,
    duration: "6 tháng",
    level: "Cơ bản → Chuyên sâu",
    badge: "Phổ biến nhất",
    salary: "15 - 35 triệu/tháng",
    demand: "Rất cao",
    skills: ["HTML/CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind"],
    gradient: "from-blue-500/10 via-sky-500/5 to-transparent",
    borderHover: "group-hover:border-blue-500/40 hover:shadow-blue-500/10",
    iconBg: "bg-blue-500/10 text-blue-600 border-blue-200/50",
    textColor: "text-blue-600 dark:text-blue-400",
    studentsCount: 4250
  },
  {
    id: "backend",
    category: "web",
    categoryLabel: "Web Development",
    title: "Backend Developer",
    description: "Xây dựng hệ thống backend quy mô lớn với Node.js, Laravel, Java Spring Boot & Architecture.",
    icon: <Server className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />,
    coursesCount: 15,
    duration: "8 tháng",
    level: "Cơ bản → Nâng cao",
    badge: "Hot Career",
    salary: "18 - 40 triệu/tháng",
    demand: "Rất cao",
    skills: ["Node.js", "Laravel", "PostgreSQL", "Redis", "Microservices", "REST API"],
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    borderHover: "group-hover:border-emerald-500/40 hover:shadow-emerald-500/10",
    iconBg: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
    textColor: "text-emerald-600 dark:text-emerald-400",
    studentsCount: 3890
  },
  {
    id: "fullstack",
    category: "fullstack",
    categoryLabel: "Fullstack",
    title: "Fullstack Engineer",
    description: "Chinh phục cả Frontend và Backend, thiết kế toàn diện hệ thống từ giao diện đến cơ sở dữ liệu.",
    icon: <Layers className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />,
    coursesCount: 20,
    duration: "10 tháng",
    level: "Toàn diện",
    badge: "Được săn đón",
    salary: "20 - 45 triệu/tháng",
    demand: "Đột phá",
    skills: ["React", "Node.js", "TypeScript", "Laravel", "Docker", "AWS"],
    gradient: "from-indigo-500/10 via-purple-500/5 to-transparent",
    borderHover: "group-hover:border-indigo-500/40 hover:shadow-indigo-500/10",
    iconBg: "bg-indigo-500/10 text-indigo-600 border-indigo-200/50",
    textColor: "text-indigo-600 dark:text-indigo-400",
    studentsCount: 5120
  },
  {
    id: "data",
    category: "data",
    categoryLabel: "Data & AI",
    title: "Data Engineering & AI",
    description: "Xử lý dữ liệu lớn, làm chủ Data Pipeline, Python, SQL, Spark & Tích hợp mô hình AI / LLM.",
    icon: <Database className="w-7 h-7 text-purple-600 dark:text-purple-400" />,
    coursesCount: 11,
    duration: "6 tháng",
    level: "Trung cấp → Chuyên gia",
    badge: "Xu hướng 2026",
    salary: "22 - 50 triệu/tháng",
    demand: "Tăng trưởng nóng",
    skills: ["Python", "SQL", "PySpark", "Kafka", "Data Warehouse", "LLM Integration"],
    gradient: "from-purple-500/10 via-fuchsia-500/5 to-transparent",
    borderHover: "group-hover:border-purple-500/40 hover:shadow-purple-500/10",
    iconBg: "bg-purple-500/10 text-purple-600 border-purple-200/50",
    textColor: "text-purple-600 dark:text-purple-400",
    studentsCount: 2940
  },
  {
    id: "mobile",
    category: "mobile",
    categoryLabel: "Mobile Dev",
    title: "Mobile App Developer",
    description: "Xây dựng ứng dụng di động iOS & Android đa nền tảng mượt mà với React Native và Flutter.",
    icon: <Smartphone className="w-7 h-7 text-amber-600 dark:text-amber-400" />,
    coursesCount: 9,
    duration: "5 tháng",
    level: "Cơ bản → Nâng cao",
    salary: "16 - 35 triệu/tháng",
    demand: "Cao",
    skills: ["Flutter", "Dart", "React Native", "Swift/Kotlin", "Firebase", "App Store/Play"],
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    borderHover: "group-hover:border-amber-500/40 hover:shadow-amber-500/10",
    iconBg: "bg-amber-500/10 text-amber-600 border-amber-200/50",
    textColor: "text-amber-600 dark:text-amber-400",
    studentsCount: 3100
  },
  {
    id: "devops",
    category: "cloud",
    categoryLabel: "DevOps & Cloud",
    title: "DevOps & Cloud Engineer",
    description: "Tự động hóa triển khai, quản trị hạ tầng điện toán đám mây với Docker, Kubernetes, CI/CD & AWS.",
    icon: <Cloud className="w-7 h-7 text-sky-600 dark:text-sky-400" />,
    coursesCount: 10,
    duration: "6 tháng",
    level: "Trung cấp → Nâng cao",
    salary: "25 - 55 triệu/tháng",
    demand: "Rất cao",
    skills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD Pipeline", "Linux Admin"],
    gradient: "from-sky-500/10 via-blue-500/5 to-transparent",
    borderHover: "group-hover:border-sky-500/40 hover:shadow-sky-500/10",
    iconBg: "bg-sky-500/10 text-sky-600 border-sky-200/50",
    textColor: "text-sky-600 dark:text-sky-400",
    studentsCount: 2180
  }
];

const CATEGORY_TABS = [
  { id: 'all', label: 'Tất cả lộ trình' },
  { id: 'web', label: 'Web Development' },
  { id: 'fullstack', label: 'Fullstack' },
  { id: 'mobile', label: 'Mobile App' },
  { id: 'data', label: 'Data & AI' },
  { id: 'cloud', label: 'DevOps & Cloud' }
];

export default function RoadmapsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roadmapsList, setRoadmapsList] = useState<RoadmapItem[]>(ROADMAPS);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      setIsLoadingApi(true);
      try {
        const backendCourses = await roadmapsApi.getRoadmaps();
        if (isMounted && Array.isArray(backendCourses) && backendCourses.length > 0) {
          // Dynamically enrich courses count from real backend courses
          setRoadmapsList(prev => prev.map(rm => ({
            ...rm,
            coursesCount: Math.max(rm.coursesCount, backendCourses.length)
          })));
        }
      } catch (err) {
        console.warn('Backend courses load error:', err);
      } finally {
        if (isMounted) setIsLoadingApi(false);
      }
    }
    loadBackendData();
    return () => { isMounted = false; };
  }, []);

  const filteredRoadmaps = roadmapsList.filter((item) => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch = searchQuery.trim() === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Modern Hero Section with Subtle Gradient Mesh */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background border-b border-border/50 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-bold mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Lộ Trình Chuẩn Định Hướng IT 2026</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight max-w-4xl mx-auto">
              Định hướng sự nghiệp IT <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Từng bước vững chắc từ số 0
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
              Các lộ trình học tập được đóng gói chuẩn mực theo khung năng lực doanh nghiệp. 
              Hệ thống bài giảng thực chiến, dự án thực tế cùng sự hỗ trợ trực tiếp từ các Senior Tech Lead.
            </p>

            {/* Quick Stats Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-border/40">
              <div className="p-3 sm:p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/50 text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-black text-foreground">6+ Lộ trình</p>
                  <p className="text-xs text-muted-foreground">Chuyên sâu chuẩn mực</p>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/50 text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-black text-foreground">80+ Khóa học</p>
                  <p className="text-xs text-muted-foreground">Thực chiến bài bản</p>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/50 text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-black text-foreground">18,500+</p>
                  <p className="text-xs text-muted-foreground">Học viên tin tưởng</p>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/50 text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-black text-foreground">94.8%</p>
                  <p className="text-xs text-muted-foreground">Có việc làm sau tốt nghiệp</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          {/* Controls: Search and Category Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105'
                      : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm theo kỹ năng, tên lộ trình..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card text-sm rounded-xl border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          {/* Roadmaps Grid */}
          {filteredRoadmaps.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-3xl border border-border/50">
              <Map className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-1">Không tìm thấy lộ trình phù hợp</h3>
              <p className="text-sm text-muted-foreground mb-4">Vui lòng thử tìm kiếm lại với từ khóa khác hoặc chuyển danh mục.</p>
              <Button variant="outline" onClick={() => { setActiveTab('all'); setSearchQuery(''); }} className="rounded-xl">
                Xem tất cả lộ trình
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredRoadmaps.map((roadmap) => (
                <Link
                  to={`/roadmaps/${roadmap.id}`}
                  key={roadmap.id}
                  className={`group relative bg-card rounded-3xl border border-border/60 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden ${roadmap.borderHover}`}
                >
                  {/* Subtle Background Glow Accent */}
                  <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br ${roadmap.gradient} blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none`} />

                  <div>
                    {/* Card Top Row: Icon + Badge */}
                    <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
                      <div className={`w-14 h-14 rounded-2xl ${roadmap.iconBg} border flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                        {roadmap.icon}
                      </div>

                      {roadmap.badge ? (
                        <span className="px-3 py-1 text-[11px] font-extrabold rounded-full bg-primary/10 text-primary border border-primary/20 tracking-tight">
                          {roadmap.badge}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-muted text-muted-foreground">
                          {roadmap.categoryLabel}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="relative z-10 mb-5">
                      <h3 className="text-xl font-bold tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {roadmap.title}
                        <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {roadmap.description}
                      </p>
                    </div>

                    {/* Salary & Hiring Demand Tags */}
                    <div className="relative z-10 bg-muted/40 p-3 rounded-2xl border border-border/40 mb-5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Thu nhập kỳ vọng:
                        </span>
                        <span className="font-bold text-foreground">{roadmap.salary}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" /> Nhu cầu tuyển dụng:
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{roadmap.demand}</span>
                      </div>
                    </div>

                    {/* Skill Pills */}
                    <div className="relative z-10 flex flex-wrap gap-1.5 mb-6">
                      {roadmap.skills.map((skill, i) => (
                        <span 
                          key={i} 
                          className="px-2.5 py-1 bg-background text-[11px] font-medium text-foreground/80 rounded-lg border border-border/50 group-hover:border-primary/20 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom Row: Meta Info + Action CTA */}
                  <div className="relative z-10 pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        {roadmap.coursesCount} khóa
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {roadmap.duration}
                      </span>
                    </div>

                    <div className={`text-xs font-bold ${roadmap.textColor} flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
                      Khám phá <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Why MindHub Roadmaps Section */}
        <section className="bg-muted/30 border-y border-border/50 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                Vì sao nên chọn Lộ trình học tại MindHub?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Chúng tôi cam kết mang lại trải nghiệm học tập toàn diện nhất, giúp bạn rút ngắn thời gian và tối ưu hiệu quả công việc thực tế.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card p-6 rounded-2xl border border-border/60 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-foreground">Chuẩn Khung Doanh Nghiệp</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Nội dung lộ trình được thiết kế chuẩn mực từ yêu cầu tuyển dụng thực tế của các tập đoàn IT hàng đầu.
                </p>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border/60 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Code className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-foreground">Dự Án Thực Chiến 100%</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Học đi đôi với hành thông qua các dự án sản phẩm hoàn chỉnh để đưa trực tiếp vào CV xin việc.
                </p>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border/60 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-foreground">Mentor Đồng Hành 1-1</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Đội ngũ giảng viên và trợ giảng hỗ trợ giải đáp thắc mắc code và sửa bài tập chi tiết hàng ngày.
                </p>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border/60 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-foreground">Chứng Chỉ & Hỗ Trợ Việc Làm</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cấp chứng chỉ hoàn thành lộ trình có giá trị và hỗ trợ kết nối mạng lưới doanh nghiệp tuyển dụng.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-indigo-600 to-purple-700 p-8 sm:p-12 md:p-16 text-white text-center shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)] pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white inline-block mb-4">
                Tư Vấn Miễn Phí
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
                Chưa biết bắt đầu từ lộ trình nào?
              </h2>

              <p className="text-white/90 text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed">
                Đội ngũ chuyên gia MindHub luôn sẵn sàng lắng nghe mục tiêu sự nghiệp của bạn và thiết kế lộ trình cá nhân hóa tối ưu nhất.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-bold rounded-2xl px-8 h-12 shadow-lg"
                  asChild
                >
                  <Link to="/contact">
                    Đăng ký tư vấn 1-1 miễn phí
                  </Link>
                </Button>

                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto border-white/40 bg-white/10 text-white hover:bg-white/20 font-bold rounded-2xl px-8 h-12 backdrop-blur-md"
                  asChild
                >
                  <Link to="/courses">
                    Khám phá toàn bộ khóa học
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
