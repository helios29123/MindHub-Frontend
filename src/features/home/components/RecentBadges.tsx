import React, { useEffect, useState } from "react";
import { Trophy, Zap, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { apiFetchEnvelope } from "@/shared/lib/api-client";

export function RecentBadges() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetchEnvelope("/users/me/activity")
      .then((res) => {
        setStats(res.data.stats);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy huy hiệu:", err);
        setStats({
          completed_courses_count: 0,
          streak_count: 0
        });
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="mb-6 bg-card p-5 rounded-2xl border border-border/50 shadow-sm animate-pulse h-32 flex flex-col justify-center items-center">
        <Trophy className="w-8 h-8 text-muted-foreground/30 animate-bounce mb-2" />
        <span className="text-muted-foreground text-xs font-medium">Đang tải huy hiệu...</span>
      </div>
    );
  }

  const isFastLearnerUnlocked = stats.completed_courses_count >= 1;
  const isStreakUnlocked = stats.streak_count >= 7;

  return (
    <div className="mb-6 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
      <Link to="/achievements" className="text-sm font-bold tracking-tight uppercase flex items-center gap-2 mb-4 hover:text-primary transition-colors hover:underline">
        <Trophy className="w-4 h-4 text-amber-500" />
        Huy hiệu nổi bật
      </Link>

      <div className="flex justify-between items-center px-2">
        {/* Badge 1 - Fast Learner */}
        <Link to="/achievements" className={`flex flex-col items-center gap-2 group cursor-pointer w-1/3 block ${!isFastLearnerUnlocked ? 'opacity-40 grayscale' : ''}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${isFastLearnerUnlocked ? 'bg-amber-100' : 'bg-slate-200'}`}>
            <Zap className={`w-6 h-6 ${isFastLearnerUnlocked ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground text-center group-hover:text-primary transition-colors">Fast Learner</span>
        </Link>
        
        {/* Badge 2 - 7 Day Streak */}
        <Link to="/achievements" className={`flex flex-col items-center gap-2 group cursor-pointer w-1/3 block ${!isStreakUnlocked ? 'opacity-40 grayscale' : ''}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${isStreakUnlocked ? 'bg-rose-100' : 'bg-slate-200'}`}>
            <Flame className={`w-6 h-6 ${isStreakUnlocked ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground text-center group-hover:text-primary transition-colors">7 Day Streak</span>
        </Link>

        {/* See all */}
        <Link to="/achievements" className="flex flex-col items-center gap-2 group cursor-pointer w-1/3 block">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-dashed border-border group-hover:border-primary transition-colors">
            <span className="text-xl opacity-50">+</span>
          </div>
          <span className="text-xs font-medium text-center text-muted-foreground group-hover:text-primary transition-colors hover:underline">Xem tất cả</span>
        </Link>
      </div>
    </div>
  );
}
