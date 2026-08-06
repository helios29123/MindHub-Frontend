import React from "react";
import { Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useActivityCalendarData } from "../hooks/useActivityCalendarData";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ActivityCalendar() {
  const { data, isLoading, error } = useActivityCalendarData();
  
  // Lấy thông tin tháng hiện tại
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const currentDay = currentDate.getDate();
  
  // Tính toán lưới lịch
  const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => {
    let day = new Date(year, month - 1, 1).getDay();
    // Chuyển Chủ nhật (0) thành 7, Thứ 2 (1) thành 1, ... để tính padding
    return day === 0 ? 7 : day;
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  
  // Padding trước mùng 1 (bắt đầu từ Thứ 2 = 1)
  const paddingDays = firstDay - 1;
  
  // Tạo mảng hiển thị (bao gồm cả padding)
  const totalCells = paddingDays + daysInMonth;
  const cells = Array.from({ length: totalCells }).map((_, index) => {
    if (index < paddingDays) return null; // padding
    return index - paddingDays + 1; // ngày
  });

  const getIntensityClass = (intensity: number, isToday: boolean) => {
    let baseClass = "";
    switch (intensity) {
      case 1: baseClass = "bg-primary/20"; break;
      case 2: baseClass = "bg-primary/40"; break;
      case 3: baseClass = "bg-primary/60"; break;
      default: baseClass = "bg-muted"; break; // 0 hoặc không có
    }
    if (isToday) {
      baseClass += " border border-primary-foreground";
    }
    return baseClass;
  };

  if (isLoading) {
    return (
      <div className="mb-6 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-4">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-sm" />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border/50">
          <Skeleton className="h-4 w-32 mb-2" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div>
              <Skeleton className="h-4 w-40 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Debugging: If there's an error or data is null, print it to the screen
  if (!isLoading && (error || !data)) {
    return (
      <div className="mb-6 bg-card p-5 rounded-2xl border border-border/50 shadow-sm text-red-500 text-xs overflow-auto">
        <p>Error: {error ? error.message : "Data is null"}</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  const heatmapData = data?.heatmap || [];
  const getDayIntensity = (day: number) => {
    const dateString = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = heatmapData.find(item => item.date === dateString);
    return dayData ? dayData.intensity : 0;
  };

  const mission = data?.daily_mission;

  return (
    <div className="mb-6 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Link to="/achievements" className="text-sm font-bold tracking-tight uppercase flex items-center gap-2 hover:text-primary transition-colors hover:underline">
          <CalendarIcon className="w-4 h-4" />
          Lịch hoạt động
        </Link>
        <span className="text-xs font-semibold text-muted-foreground">Tháng {currentMonth}</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[10px] font-bold text-muted-foreground uppercase mb-2">
        <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-4">
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`padding-${index}`} className="aspect-square rounded-sm bg-transparent" />;
          }
          
          const isToday = day === currentDay;
          const intensity = getDayIntensity(day);
          
          return (
            <div 
              key={`day-${day}`} 
              className={`aspect-square rounded-sm ${getIntensityClass(intensity, isToday)} cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all`}
              title={isToday ? 'Hôm nay' : `Ngày ${day}`}
            />
          );
        })}
      </div>
      
      {mission && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-sm font-medium">Nhiệm vụ hôm nay:</p>
          <Link to="/my-courses" className="flex items-start gap-3 mt-2 group cursor-pointer block">
            {mission.is_completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex-shrink-0 mt-0.5 group-hover:border-primary transition-colors"></div>
            )}
            <div>
              <p className={`text-sm font-medium group-hover:text-primary transition-colors leading-tight hover:underline ${mission.is_completed ? 'line-through opacity-70' : ''}`}>
                {mission.title} ({mission.progress}/{mission.target})
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">+{mission.reward_xp} XP</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
