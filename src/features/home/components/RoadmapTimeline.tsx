import React, { useEffect, useState } from "react";
import { CheckCircle2, Circle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ApiService } from "@/services/api";

export interface RoadmapStepItem {
  id: string | number;
  title: string;
  status: "completed" | "in-progress" | "pending";
  progress?: number;
}

export function RoadmapTimeline() {
  const [steps, setSteps] = useState<RoadmapStepItem[]>([
    { id: 1, title: "HTML & CSS Cơ bản", status: "completed" },
    { id: 2, title: "JavaScript Cơ bản", status: "completed" },
    { id: 3, title: "React JS", status: "in-progress", progress: 68 },
    { id: 4, title: "Next.js", status: "pending" },
    { id: 5, title: "Project Thực tế", status: "pending" },
  ]);

  const [roadmapTitle, setRoadmapTitle] = useState("Frontend Developer Roadmap");
  const [completionPercent, setCompletionPercent] = useState<number>(40);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function fetchRealRoadmapProgress() {
      try {
        const [dashboardData, purchasedCourses, nextPathCourses] = await Promise.allSettled([
          ApiService.getLearningDashboard(),
          ApiService.getMyPurchasedCourses(),
          ApiService.getNextLearningPath()
        ]);

        if (!isMounted) return;

        let rawEnrolled: any[] = [];
        if (purchasedCourses.status === 'fulfilled' && Array.isArray(purchasedCourses.value)) {
          rawEnrolled = purchasedCourses.value;
        }

        let dashRecent: any = null;
        if (dashboardData.status === 'fulfilled' && dashboardData.value?.recent_course) {
          dashRecent = dashboardData.value.recent_course;
          if (dashRecent.category_name) {
            setRoadmapTitle(`${dashRecent.category_name} Roadmap`);
          }
        }

        const defaultMilestones = [
          { title: "HTML & CSS Cơ bản" },
          { title: "JavaScript Cơ bản" },
          { title: "React JS" },
          { title: "Next.js & TypeScript" },
          { title: "Project Thực tế" }
        ];

        if (rawEnrolled.length > 0) {
          const parsedSteps: RoadmapStepItem[] = defaultMilestones.map((def, idx) => {
            const enrolledItem = rawEnrolled[idx];
            if (enrolledItem) {
              const course = enrolledItem.course || enrolledItem;
              const progress = typeof enrolledItem.progress_percent === 'number' 
                ? enrolledItem.progress_percent 
                : (enrolledItem.progress || 0);

              let status: "completed" | "in-progress" | "pending" = "pending";
              if (progress >= 100 || enrolledItem.status === 'completed') {
                status = "completed";
              } else if (progress > 0 || idx === 0) {
                status = "in-progress";
              }

              return {
                id: course.id || idx + 1,
                title: course.title || def.title,
                status,
                progress: Math.round(progress)
              };
            }

            // Unenrolled remaining steps
            const prevCompleted = idx > 0 && rawEnrolled[idx - 1] && ((rawEnrolled[idx - 1].progress_percent ?? 0) >= 100);
            return {
              id: idx + 1,
              title: def.title,
              status: prevCompleted ? "in-progress" : "pending",
              progress: 0
            };
          });

          const completedCount = parsedSteps.filter(s => s.status === 'completed').length;
          const currentInProgress = parsedSteps.find(s => s.status === 'in-progress');
          const extraProgress = currentInProgress && currentInProgress.progress ? (currentInProgress.progress / parsedSteps.length) : 0;
          const percent = Math.min(100, Math.round(((completedCount / parsedSteps.length) * 100) + (extraProgress * 0.2)));

          setSteps(parsedSteps);
          setCompletionPercent(percent);
        } else {
          // Default baseline calculation when learner has not enrolled in DB courses yet
          const completedCount = steps.filter(s => s.status === 'completed').length;
          setCompletionPercent(Math.round((completedCount / steps.length) * 100));
        }
      } catch (err) {
        console.warn('Real roadmap progress load notice:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchRealRoadmapProgress();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="mb-8 p-6 md:p-8 pb-16 bg-card rounded-3xl border border-border/70 shadow-xs relative overflow-hidden">
      {/* Glow decorative backdrop */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-primary tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Lộ trình học tập cá nhân
          </div>
          <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">{roadmapTitle}</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5 font-medium">
            {isLoading ? "Đang tải tiến độ CSDL..." : `Bạn đã hoàn thành ${completionPercent}% chặng đường`}
          </p>
        </div>

        <Link 
          to="/roadmaps/frontend" 
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-extrabold transition-all shrink-0"
        >
          <span>Xem chi tiết lộ trình</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Progress Timeline View */}
      {isLoading ? (
        <div className="py-12 flex items-center justify-center gap-2 text-muted-foreground text-xs font-bold">
          <Loader2 className="w-5 h-5 animate-spin text-primary" /> Đang cập nhật lộ trình từ CSDL...
        </div>
      ) : (
        <div className="relative px-2 md:px-8">
          {/* Background Track Line */}
          <div className="absolute top-1/2 left-6 right-6 h-2 bg-muted -translate-y-1/2 rounded-full hidden md:block" />
          
          {/* Active Progress Track Fill */}
          <div 
            className="absolute top-1/2 left-6 h-2 bg-gradient-to-r from-primary to-emerald-500 -translate-y-1/2 rounded-full hidden md:block transition-all duration-1000 ease-out" 
            style={{ width: `${Math.max(10, completionPercent)}%` }} 
          />

          {/* Timeline Milestones Steps */}
          <div className="flex flex-col md:flex-row justify-between relative gap-6 md:gap-0">
            {steps.map((step, index) => {
              const isCompleted = step.status === "completed";
              const isInProgress = step.status === "in-progress";

              return (
                <div key={step.id || index} className="flex md:flex-col items-center gap-4 md:gap-3 relative z-10 group cursor-pointer">
                  {/* Step Node Icon */}
                  <div className="bg-card p-1.5 rounded-full transition-transform group-hover:scale-110">
                    {isCompleted ? (
                      <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-emerald-500 fill-emerald-500/15" />
                    ) : isInProgress ? (
                      <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        <div className="w-full h-full rounded-full border-2 border-primary flex items-center justify-center bg-card z-10 shadow-xs">
                          <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-primary" />
                        </div>
                      </div>
                    ) : (
                      <Circle className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground/50" />
                    )}
                  </div>
                  
                  {/* Milestone Label */}
                  <div className="flex-1 md:flex-none md:text-center md:absolute md:top-14 md:left-1/2 md:-translate-x-1/2 md:w-36">
                    <p className={`text-xs md:text-sm font-extrabold ${
                      isCompleted ? "text-emerald-600" : 
                      isInProgress ? "text-primary" : "text-muted-foreground/80"
                    } group-hover:text-primary transition-colors leading-snug line-clamp-2`}>
                      {step.title}
                    </p>
                    {isInProgress && step.progress !== undefined && step.progress > 0 && (
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {step.progress}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
