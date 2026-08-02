import React, { useEffect, useState } from "react";
import { BookOpen, CheckCircle, Clock, Award } from "lucide-react";
import { apiFetchEnvelope } from "@/shared/lib/api-client";

export function LearningStatsWidget() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetchEnvelope("/users/me/activity")
      .then((res) => {
        setStats(res.data.stats);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy thống kê học tập:", err);
        setStats({
          active_courses_count: 0,
          completed_courses_count: 0,
          learning_hours: 0,
          certificates_count: 0
        });
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm mb-6 animate-pulse h-40 flex flex-col justify-center items-center">
        <Award className="w-8 h-8 text-muted-foreground/30 animate-bounce mb-2" />
        <span className="text-muted-foreground text-xs font-medium">Đang tải thống kê...</span>
      </div>
    );
  }

  const { active_courses_count, completed_courses_count, learning_hours, certificates_count } = stats;

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm mb-6">
      <h3 className="font-bold text-base mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-primary" />
        Thống kê học tập
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/30 p-3 rounded-xl border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Đang học</span>
          </div>
          <span className="text-xl font-bold">{active_courses_count}</span>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-xl border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Hoàn thành</span>
          </div>
          <span className="text-xl font-bold">{completed_courses_count}</span>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-xl border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Giờ học</span>
          </div>
          <span className="text-xl font-bold">{learning_hours}h</span>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-xl border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Chứng chỉ</span>
          </div>
          <span className="text-xl font-bold">{certificates_count}</span>
        </div>
      </div>
    </div>
  );
}
