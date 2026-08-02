import React, { useEffect, useState } from "react";
import { Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { apiFetchEnvelope } from "@/shared/lib/api-client";

export function ActivityCalendar() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetchEnvelope("/users/me/activity")
      .then((res) => {
        setData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy hoạt động:", err);
        // Fallback to empty current month calendar
        const now = new Date();
        const year = now.getFullYear();
        const monthNum = now.getMonth() + 1;
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        // first day of month (0 = Monday, 6 = Sunday)
        const firstDay = (new Date(year, now.getMonth(), 1).getDay() + 6) % 7;
        
        setData({
          month: `Tháng ${monthNum}`,
          month_number: monthNum,
          year: year,
          days_in_month: daysInMonth,
          first_day_of_week: firstDay,
          activities: {},
          daily_mission: {
            description: "Hoàn thành bài học",
            target_count: 2,
            current_count: 0,
            xp_reward: 50,
            completed: false
          }
        });
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="mb-6 bg-card p-5 rounded-2xl border border-border/50 shadow-sm animate-pulse h-64 flex flex-col items-center justify-center">
        <CalendarIcon className="w-8 h-8 text-muted-foreground/30 animate-bounce mb-2" />
        <span className="text-muted-foreground text-xs font-medium">Đang tải lịch hoạt động...</span>
      </div>
    );
  }

  const { month, month_number, year, days_in_month, first_day_of_week, activities, daily_mission } = data;

  // Render empty cells for alignment
  const emptyCells = Array.from({ length: first_day_of_week });

  // Render actual days
  const days = Array.from({ length: days_in_month });

  return (
    <div className="mb-6 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Link to="/achievements" className="text-sm font-bold tracking-tight uppercase flex items-center gap-2 hover:text-primary transition-colors hover:underline">
          <CalendarIcon className="w-4 h-4" />
          Lịch hoạt động
        </Link>
        <span className="text-xs font-semibold text-muted-foreground">{month} {year}</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[10px] font-bold text-muted-foreground uppercase mb-2">
        <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
      </div>
      
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-4">
        {/* Empty padding cells */}
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square opacity-0 pointer-events-none" />
        ))}

        {/* Calendar days */}
        {days.map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month_number).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const activity = activities[dateStr] || { duration_seconds: 0, lessons_count: 0 };
          const minutes = Math.round(activity.duration_seconds / 60);

          // Determine shading color based on minutes
          let bgColorClass = "bg-muted hover:bg-muted/80";
          if (minutes > 0) {
            if (minutes < 15) {
              bgColorClass = "bg-emerald-500/20 text-emerald-900";
            } else if (minutes < 30) {
              bgColorClass = "bg-emerald-500/40 text-emerald-950";
            } else if (minutes < 60) {
              bgColorClass = "bg-emerald-500/70 text-white";
            } else {
              bgColorClass = "bg-emerald-500 text-white";
            }
          }

          // Tooltip description
          let tooltipText = `Ngày ${dayNum}/${month_number}: `;
          if (minutes === 0) {
            tooltipText += "Chưa học phút nào";
          } else if (minutes >= 60) {
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            tooltipText += `Đã học ${h} giờ ${m > 0 ? `${m} phút` : ""}`;
          } else {
            tooltipText += `Đã học ${minutes} phút`;
          }

          if (activity.lessons_count > 0) {
            tooltipText += ` (${activity.lessons_count} bài học)`;
          }

          return (
            <div key={dayNum} className="relative group aspect-square">
              <div 
                className={`w-full h-full rounded-sm ${bgColorClass} cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all`}
              />
              {/* Custom tooltip styled with Tailwind */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block z-[999] bg-slate-900 text-white text-[10px] font-semibold py-1 px-2.5 rounded shadow-lg whitespace-nowrap pointer-events-none">
                {tooltipText}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-900 w-0 h-0" />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-sm font-medium">Nhiệm vụ hôm nay:</p>
        <Link to="/my-courses" className="flex items-start gap-3 mt-2 group cursor-pointer block">
          {daily_mission.completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10 flex-shrink-0 mt-0.5" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex-shrink-0 mt-0.5 group-hover:border-primary transition-colors flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:text-primary">
              {daily_mission.current_count}/{daily_mission.target_count}
            </div>
          )}
          <div>
            <p className={`text-sm font-medium group-hover:text-primary transition-colors leading-tight hover:underline ${daily_mission.completed ? 'line-through text-muted-foreground' : ''}`}>
              {daily_mission.description} ({daily_mission.current_count}/{daily_mission.target_count})
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">+{daily_mission.xp_reward} XP</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
