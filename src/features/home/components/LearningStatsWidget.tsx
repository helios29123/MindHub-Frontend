import React from "react";
import { BookOpen, CheckCircle, Clock, Award } from "lucide-react";
import { ILearningStatistics } from "@/types/learningDashboard";

interface Props {
  statistics?: ILearningStatistics;
}

export function LearningStatsWidget({ statistics }: Props) {
  const data = statistics || {
    active_courses: 0,
    completed_courses: 0,
    total_learning_hours: 0,
    certificates_count: 0
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm mb-6">
      <h3 className="font-bold text-base mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-award w-4 h-4 text-primary" aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path><circle cx="12" cy="8" r="6"></circle></svg>
        Thống kê học tập
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/30 p-3 rounded-xl border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open w-3.5 h-3.5" aria-hidden="true"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
            <span className="text-xs font-semibold uppercase tracking-wider">Đang học</span>
          </div>
          <span className="text-xl font-bold">{data.active_courses}</span>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-xl border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big w-3.5 h-3.5 text-green-500" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
            <span className="text-xs font-semibold uppercase tracking-wider">Hoàn thành</span>
          </div>
          <span className="text-xl font-bold">{data.completed_courses}</span>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-xl border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-3.5 h-3.5 text-blue-500" aria-hidden="true"><path d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="10"></circle></svg>
            <span className="text-xs font-semibold uppercase tracking-wider">Giờ học</span>
          </div>
          <span className="text-xl font-bold">{data.total_learning_hours}h</span>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-xl border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-award w-3.5 h-3.5 text-amber-500" aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path><circle cx="12" cy="8" r="6"></circle></svg>
            <span className="text-xs font-semibold uppercase tracking-wider">Chứng chỉ</span>
          </div>
          <span className="text-xl font-bold">{data.certificates_count}</span>
        </div>
      </div>
    </div>
  );
}
